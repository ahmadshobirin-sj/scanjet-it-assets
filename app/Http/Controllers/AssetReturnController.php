<?php

namespace App\Http\Controllers;

use App\DTOs\AssetReturnResult;
use App\Enums\AppNotificationStatus;
use App\Enums\AppNotificationType;
use App\Enums\AssetStatus;
use App\Exceptions\ClientException;
use App\Http\Filters\GlobalSearchNew;
use App\Http\Requests\AssetReturn\AssetReturnStoreRequest;
use App\Http\Services\AssetReturnService;
use App\Http\Tables\AssignmentReturnLogTable;
use App\Models\AssetReturn;
use App\Notifications\AppNotification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class AssetReturnController
{
    use AuthorizesRequests;

    public function __construct(
        protected AssetReturnService $assetReturnService,
    ) {}

    public function create(Request $request, string $reference_code)
    {
        $this->authorize('create', AssetReturn::class);
        $assetAssignment = null;
        $assets = [];
        $returnLog = [];

        try {
            $assetAssignment = $this->assetReturnService->getByReferenceCode($reference_code, [
                'assigned_user:id,name,email,job_title,office_location',
                'assigned_by:id,name,email,job_title,office_location',
            ]);

            if (empty($assignment->confirmed_at)) {
                throw new ClientException('This assignment has not been confirmed by the user', code: 404);
            }

            $returnLog = AssignmentReturnLogTable::make('returnLog', $assetAssignment->id)->toSchema();

            $assets = Inertia::optional(fn () => $this->assetReturnService->getAssets($this->assetsQueryBuilder($request, $assetAssignment->assigned_assets())));
        } catch (\Throwable $th) {
            if (app()->isProduction()) {
                report($th);
            } else {
                throw $th;
            }
        }

        return Inertia::render('asset-assignment/return', [
            'assetAssignment' => $assetAssignment,
            'assets' => $assets,
            'returnLog' => $returnLog,
        ]);
    }

    public function store(AssetReturnStoreRequest $request, string $reference_code)
    {
        $this->authorize('create', AssetReturn::class);

        try {
            $data = $request->validated();

            // default: penerima adalah user yang sedang login (jika tidak diisi)
            $data['received_by_user_id'] = $data['received_by_user_id'] ?? Auth::id();

            /** @var AssetReturnResult $result */
            $result = $this->assetReturnService->returnAssets($data, $reference_code);

            $assignment = $result->assignment->loadMissing('assigned_by'); // jaga-jaga
            $return = $result->return->loadMissing('received_by');
            $actor = Auth::user();               // yang mengeksekusi aksi
            $assignedBy = $assignment->assigned_by;    // pembuat assignment (bisa null)

            $handledByOther = $assignedBy->id !== $actor->id;

            // 1) Notifikasi ke aktor (selalu)
            $desc = 'Assets returned successfully for reference code '.$assignment->reference_code.'.';
            if ($handledByOther) {
                $desc .= ' Note: this return was recorded as received by '.($receivedBy->name ?? 'another user').'.';
            }

            $dataNotification = [
                'reference_code' => $assignment->reference_code,
                'return_code' => $return->return_code,
            ];

            Notification::send(
                $actor,
                (new AppNotification(
                    message: 'Asset Return Confirmation',
                    description: $desc,
                    data: $dataNotification,
                ))->type(AppNotificationType::EMAIL)
                    ->status(AppNotificationStatus::SUCCESS)
                    ->afterCommit()
            );

            // 2) Jika assigned_by ≠ received_by, beritahu pembuat assignment
            if ($handledByOther) {
                Notification::send(
                    $assignedBy,
                    (new AppNotification(
                        message: 'Asset Return Processed by '.($receivedBy->name ?? 'another user'),
                        description: "Assets for {$assignment->reference_code} were returned and received by ".($receivedBy->name ?? 'another user').'.',
                        data: $dataNotification,
                    ))->type(AppNotificationType::DEFAULT)
                        ->status(AppNotificationStatus::INFO)
                        ->afterCommit()
                );
            }

            /**
             * TODO:
             * pindah ke halaman detail return
             */
            return redirect()->route('asset-assignment.index');
        } catch (\Throwable $th) {
            if (app()->isProduction()) {
                report($th);
            } else {
                throw $th; // biar kelihatan stacktrace saat dev
            }

            return back();
        }
    }

    private function assetsQueryBuilder(Request $request, $asset)
    {
        $dp_request = $request->duplicate($request->input('asset', []));

        $query = QueryBuilder::for($asset, $dp_request)
            ->select(['id', 'name', 'serial_number', 'asset_tag', 'category_id', 'manufacture_id'])
            ->when($asset instanceof Builder, function ($query) {
                $query->where('status', AssetStatus::AVAILABLE);
            })
            ->allowedFilters([
                AllowedFilter::custom('search', new GlobalSearchNew(['name', 'serial_number', 'asset_tag', 'category.name', 'manufacture.name'])),
            ])
            ->with([
                'category:id,name',
                'manufacture:id,name',
            ])
            ->allowedSorts(['name'])
            ->defaultSort('name')
            ->limit(10)
            ->getEloquentBuilder();

        return $query;
    }
}
