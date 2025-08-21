<?php

namespace App\Http\Controllers;

use App\Enums\AppNotificationStatus;
use App\Enums\AppNotificationType;
use App\Enums\AssetStatus;
use App\Http\Filters\GlobalSearchNew;
use App\Http\Requests\AssetAssignment\AssetAssigmentRequest;
use App\Http\Services\AssetAsignmentService;
use App\Http\Tables\AssetAssignmentTable;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\ExternalUser;
use App\Notifications\AppNotification;
use App\Notifications\AssetAssignmentConfirmation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

/**
 * TODO:
 * add cancel feature for assigned and returned
 * Max 7 assets for assignment
 * automatically confirm if document assignment more than equals 5 days (run a cronjob every Midnight)
 */
class AssetAssignmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected AssetAsignmentService $assetAssignmentService,
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $this->authorize('viewAny', AssetAssignment::class);

        $assetAssignments = [];
        $tableSchema = [];

        try {
            $assetAssignments = AssetAssignmentTable::make('assignments')->toSchema();
        } catch (\Throwable $th) {
            if (app()->isProduction()) {
                report($th);
            } else {
                throw $th;
            }
        }

        return Inertia::render('asset-assignment/list', [
            'assignments' => $assetAssignments,
            'table' => $tableSchema,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $this->authorize('create', AssetAssignment::class);

        $employees = Inertia::optional(fn () => $this->assetAssignmentService->getEmployees($this->employeesQueryBuilder($request)));
        $assets = Inertia::optional(fn () => $this->assetAssignmentService->getAssets($this->assetsQueryBuilder($request, Asset::select())));

        return Inertia::render('asset-assignment/assign', [
            'employees' => $employees,
            'assets' => $assets,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function assign(AssetAssigmentRequest $request)
    {
        $this->authorize('create', AssetAssignment::class);

        try {
            $data = $request->validated();

            $assetAssignment = $this->assetAssignmentService->assign($data);

            $assignments = $this->assetAssignmentService->makeAssignmentMailPayload($assetAssignment);
            Notification::send(
                Auth::user(),
                (
                    new AppNotification(
                        message: 'Asset Assignment Confirmation',
                        description: 'Assets assigned successfully to '.$assignments['assigned_user']['email'].'.',
                        data: [
                            'reference_code' => $assetAssignment->reference_code,
                        ],
                    )
                )
                    ->type(AppNotificationType::EMAIL)
                    ->status(AppNotificationStatus::SUCCESS)
                    ->afterCommit()
            );

            Notification::route('mail', $assignments['assigned_user']['email'])
                ->notify((new AssetAssignmentConfirmation($assignments))->afterCommit());

            return redirect()
                ->route('asset-assignment.index')->with('success', [
                    'message' => 'Assets assigned successfully.',
                ]);
        } catch (\Throwable $th) {
            if (app()->isProduction()) {
                report($th);
            } else {
                throw $th;
            }

            return back()->withErrors([
                'message' => 'Failed to assign assets.',
            ]);
        }
    }

    public function confirmation(Request $request, string $reference_code)
    {
        $assetAssignment = null;
        try {
            $assetAssignment = $this->assetAssignmentService->confirmation($reference_code);

            if ($assetAssignment === false) {
                return response('Asset assignment already confirmed.', 200);
            }

            Notification::send(
                $assetAssignment->assigned_by,
                (new AppNotification(
                    message: 'Asset Assignment Confirmation',
                    description: 'Asset assignment to '.$assetAssignment->assigned_user->email.' confirmed successfully.',
                    data: [
                        'reference_code' => $assetAssignment->reference_code,
                    ],
                ))->type(AppNotificationType::EMAIL)->status(AppNotificationStatus::SUCCESS)
            );

            return response('Asset assignment confirmed successfully.', 200);
        } catch (\Throwable $th) {
            report($th);

            if (isset($assetAssignment) && $assetAssignment) {
                Notification::send(
                    $assetAssignment->assigned_by,
                    (new AppNotification(
                        message: 'Asset Assignment Confirmation Failed',
                        description: 'There was an error while confirming the assignment to '.$assetAssignment->assigned_user->email,
                        data: [
                            'reference_code' => $assetAssignment->reference_code,
                        ],
                    ))->type(AppNotificationType::EMAIL)->status(AppNotificationStatus::ERROR)
                );
            }

            return response('Asset assignment confirmation failed.', 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AssetAssignment $assetAssignment)
    {
        //
    }

    public function exportPDF(Request $request, string $reference_code)
    {
        $this->authorize('exportPdf', AssetAssignment::class);
        try {
            $assetAssignment = $this->assetAssignmentService->getByReferenceCode(
                $reference_code,
                [
                    'assigned_user:id,name,email,job_title,office_location',
                    'assigned_by:id,name,email,job_title,office_location',
                ]
            );
            $assetAssignment->load([
                'assets' => function ($q) use ($assetAssignment) {
                    $q->select('assets.id', 'assets.name', 'assets.serial_number', 'assets.asset_tag', 'assets.category_id')
                        ->with('category:id,name')
                        ->withExists([
                            'assignments as assigned_before_this' => fn ($qq) => $qq->where('asset_assignment_id', '!=', $assetAssignment->id),
                        ]);
                },
            ]);

            $data = [
                'header' => [
                    'title' => 'IT Hardware Asset Assignment Form',
                    'code' => 'FRM-IT-01-HW-2025',
                    'version' => '1.0',
                    'last_revised' => '',
                    'issued_by' => 'Wibowo, Rio Eibat',
                    'approved_by' => '',
                    'issue_date' => '',
                    'approved_date' => '',
                ],
                'assignment' => $assetAssignment->toArray(),
            ];

            $pdf = Pdf::loadView('pdf.asset_assignment', $data)
                ->setOption([
                    'isPhpEnabled' => true,
                    'isRemoteEnabled' => true,
                ])
                ->setPaper('A4', 'portrait'); // ukuran A4

            return $pdf->stream("{$assetAssignment->reference_code}.pdf");
        } catch (\Throwable $th) {
            if (app()->isProduction()) {
                report($th);
            } else {
                throw $th;
            }

            return back()->withErrors([
                'message' => 'Failed to export the PDF. Please try again later.',
            ]);
        }
    }

    private function employeesQueryBuilder(Request $request)
    {
        $dp_request = $request->duplicate($request->input('employee', []));

        return QueryBuilder::for(ExternalUser::query(), $dp_request)
            ->select(['id', 'name', 'email', 'office_location', 'job_title'])
            ->allowedFilters([
                AllowedFilter::custom('search', new GlobalSearchNew(['name', 'email'])),
            ])
            ->allowedSorts(['name', 'email'])
            ->defaultSort('name')
            ->limit(10)
            ->getEloquentBuilder();
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
