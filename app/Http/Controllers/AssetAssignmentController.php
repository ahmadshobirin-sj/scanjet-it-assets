<?php

namespace App\Http\Controllers;

use App\Enums\AppMessageNotificationStatus;
use App\Enums\AppMessageNotificationType;
use App\Http\Filters\GlobalSearchNew;
use App\Http\Requests\AssetAssignment\AssetAssigmentRequest;
use App\Http\Resources\AssetAssignment\AssetAssignmentResource;
use App\Http\Services\AssetAsignmentService;
use App\Http\Services\NotificationService;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\ExternalUser;
use App\Notifications\AppMessageNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class AssetAssignmentController extends Controller
{
    public function __construct(
        protected AssetAsignmentService $assetAssignmentService,
        protected NotificationService $notificationService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $assetAssignments = Inertia::optional(fn () => AssetAssignmentResource::collection(
            $this->assetAssignmentService->getAll()
        ));

        $tableSchema = Inertia::optional(fn () => $this->assetAssignmentService->getTable()->toSchema());

        return Inertia::render('asset-assignment/list', [
            'assetAssignments' => $assetAssignments,
            'table' => $tableSchema,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $employees = Inertia::optional(fn () => $this->assetAssignmentService->getEmployees($this->employeesQueryBuilder($request)));
        $assets = Inertia::optional(fn () => $this->assetAssignmentService->getAssets($this->assetsQueryBuilder($request)));

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
        try {
            $data = $request->validated();

            // $this->assetAssignmentService->assign($data);

            $this->notificationService->sendAssetAssignmentConfirmation($data);

            Notification::send(Auth::user(), new AppMessageNotification(
                title: 'Asset Assignment Confirmation',
                message: 'Assets assigned successfully.',
                type: AppMessageNotificationType::EMAIL,
                status: AppMessageNotificationStatus::INFO,
                hasDetail: true,
                data: $data
            ));

            return back();
        } catch (\Throwable $th) {
            return back();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(AssetAssignment $assetAssignment)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(AssetAssignment $assetAssignment)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, AssetAssignment $assetAssignment)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(AssetAssignment $assetAssignment)
    {
        //
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

    private function assetsQueryBuilder(Request $request)
    {
        $dp_request = $request->duplicate($request->input('asset', []));

        return QueryBuilder::for(Asset::select(), $dp_request)
            ->select(['id', 'name', 'serial_number', 'asset_tag', 'category_id', 'manufacture_id'])
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
    }
}
