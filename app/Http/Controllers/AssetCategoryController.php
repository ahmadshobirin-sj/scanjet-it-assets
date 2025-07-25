<?php

namespace App\Http\Controllers;

use App\DTOs\TableStateDTO;
use App\Http\Requests\AssetCategory\AssetCategoryStoreRequest;
use App\Http\Requests\AssetCategory\AssetCategoryUpdateRequest;
use App\Http\Resources\AssetCategoryResource;
use App\Http\Services\AssetCategoryService;
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

        $assetCategories = AssetCategoryResource::collection(
            $this->assetCategoryService->getAll($request)
        );

        $tableState = TableStateDTO::fromRequest($request);
        $tableState->setSort(['-created_at']);

        return Inertia::render('asset-category/list', [
            'asset_categories' => $assetCategories,
            'table' => $tableState->toArray(),
        ]);
    }

    public function store(AssetCategoryStoreRequest $request)
    {
        $this->authorize('create', AssetCategory::class);

        try {
            $this->assetCategoryService->create($request->validated());

            return redirect(url()->previous())->with('success', [
                'message' => 'Asset category created successfully.',
            ]);
        } catch (\Throwable $e) {
            return redirect(url()->previous())->withErrors(['message' => 'Failed to create asset category', 'error' => $e->getMessage()]);
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

            return redirect(url()->previous())->with('success', [
                'message' => 'Asset category updated successfully.',
            ]);
        } catch (\Throwable $e) {
            return redirect(url()->previous())->withErrors(['message' => 'Failed to update asset category', 'error' => $e->getMessage()]);
        }
    }

    public function destroy(AssetCategory $assetCategory)
    {
        $this->authorize('delete', $assetCategory);

        try {
            $this->assetCategoryService->delete($assetCategory);

            return redirect(url()->previous())->with('success', [
                'message' => 'Asset category deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            return redirect(url()->previous())->withErrors(['message' => 'Failed to delete asset category', 'error' => $e->getMessage()]);
        }
    }
}
