<?php

namespace App\Http\Controllers;

use App\Http\Requests\Asset\AssetStoreRequest;
use App\Http\Requests\Asset\AssetUpdateRequest;
use App\Http\Resources\Asset\AssetResource;
use App\Http\Services\AssetCategoryService;
use App\Http\Services\AssetService;
use App\Http\Services\ManufactureService;
use App\Models\Asset;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AssetController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        protected AssetService $assetService,
        protected ManufactureService $manufactureService,
        protected AssetCategoryService $assetCategoryService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Asset::class);

        $assets = Inertia::optional(fn () => AssetResource::collection(
            $this->assetService->getAll()
        ));

        $tableSchema = Inertia::optional(fn () => $this->assetService->getTable()->toSchema());

        return Inertia::render('assets/list', [
            'assets' => $assets,
            'table' => $tableSchema,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $this->authorize('create', Asset::class);

        $manufactures = Inertia::optional(fn () => $this->manufactureService->getAll($request));

        $categories = Inertia::optional(fn () => $this->assetCategoryService->getAll($request));

        return Inertia::render('assets/create', [
            'manufactures' => $manufactures,
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(AssetStoreRequest $request)
    {
        $this->authorize('create', Asset::class);

        try {
            $this->assetService->store($request->validated());

            return to_route('asset.index')
                ->with('success', [
                    'message' => 'Asset created successfully.',
                ]);
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['message' => 'Failed to create asset.', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Asset $asset)
    {
        $this->authorize('view', $asset);

        $asset->loadMissing([
            'category',
            'manufacture',
        ]);

        return Inertia::render('assets/detail', [
            'asset' => new AssetResource($asset),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Asset $asset)
    {
        $this->authorize('update', $asset);

        $asset->loadMissing([
            'category',
            'manufacture',
        ]);

        $manufactures = Inertia::optional(fn () => $this->manufactureService->getAll());

        $categories = Inertia::optional(fn () => $this->assetCategoryService->getAll());

        return Inertia::render('assets/edit', [
            'asset' => new AssetResource($asset),
            'manufactures' => $manufactures,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AssetUpdateRequest $request, Asset $asset)
    {
        $this->authorize('update', $asset);

        try {
            $this->assetService->update($asset, $request->validated());

            return to_route('asset.index')
                ->with('success', [
                    'message' => 'Asset updated successfully.',
                ]);
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['message' => 'Failed to update asset.', 'error' => $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Asset $asset)
    {
        $this->authorize('delete', $asset);

        try {
            $this->assetService->delete($asset);

            return to_route('asset.index')
                ->with('success', [
                    'message' => 'Asset deleted successfully.',
                ]);
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['message' => 'Failed to delete asset.', 'error' => $e->getMessage()]);
        }
    }
}
