<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssetCategory\AssetCategoryStoreRequest;
use App\Http\Requests\AssetCategory\AssetCategoryUpdateRequest;
use App\Http\Services\AssetCategoryService;
use App\Http\Tables\AssetCategoryTable;
use App\Models\AssetCategory;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetCategoryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected AssetCategoryService $assetCategoryService) {}

    public function index(Request $request)
    {

        $this->authorize('viewAny', AssetCategory::class);
        $assetCategories = [];

        try {
            $assetCategories = AssetCategoryTable::make('asscat')->toSchema();
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }
        }

        return Inertia::render('asset-category/list', [
            'asset_categories' => $assetCategories,
        ]);
    }

    public function store(AssetCategoryStoreRequest $request)
    {
        $this->authorize('create', AssetCategory::class);

        try {
            $this->assetCategoryService->create($request->validated());

            return redirect(url()->previous())->withSuccessFlash('Asset category created successfully.');
        } catch (\Throwable $e) {
            return redirect(url()->previous())->withErrorsFlash('Failed to create asset category');
        }
    }

    public function show(AssetCategory $assetCategory)
    {
        $this->authorize('view', $assetCategory);
    }

    public function edit(AssetCategory $assetCategory)
    {
        $this->authorize('update', $assetCategory);
    }

    public function update(AssetCategoryUpdateRequest $request, AssetCategory $assetCategory)
    {
        $this->authorize('update', $assetCategory);

        try {
            $this->assetCategoryService->update($assetCategory, $request->validated());

            return redirect(url()->previous())->withSuccessFlash('Asset category updated successfully.');
        } catch (\Throwable $e) {
            return redirect(url()->previous())->withErrorsFlash('Failed to update asset category');
        }
    }

    public function destroy(AssetCategory $assetCategory)
    {
        $this->authorize('delete', $assetCategory);

        try {
            $this->assetCategoryService->delete($assetCategory);

            return redirect(url()->previous())->withSuccessFlash('Asset category deleted successfully.');
        } catch (\Throwable $e) {
            return redirect(url()->previous())->withErrorsFlash('Failed to delete asset category');
        }
    }
}
