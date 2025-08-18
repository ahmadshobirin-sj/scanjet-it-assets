<?php

namespace App\Http\Controllers;

use App\Http\Requests\Manufacture\ManufactureStoreRequest;
use App\Http\Requests\Manufacture\ManufactureUpdateRequest;
use App\Http\Resources\ManufactureResource;
use App\Http\Services\ManufactureService;
use App\Http\Tables\ManufactureTable;
use App\Models\Manufacture;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManufactureController extends Controller
{
    use AuthorizesRequests;

    public function __construct(protected ManufactureService $manufactureService) {}

    public function index(Request $request)
    {
        $this->authorize('viewAny', Manufacture::class);

        $manufactures = [];

        try {
            $manufactures = ManufactureTable::make('manufacture')->toSchema();
        } catch (\Throwable $e) {
            if (app()->isProduction()) {
                report($e);
            } else {
                throw $e;
            }
        }

        return Inertia::render('manufacture/list', [
            'manufactures' => $manufactures,
        ]);
    }

    public function create(Request $request)
    {
        $this->authorize('create', Manufacture::class);

        return Inertia::render('manufacture/create');
    }

    public function store(ManufactureStoreRequest $request)
    {
        $this->authorize('create', Manufacture::class);

        try {
            $this->manufactureService->create($request->validated());

            return redirect()->route('manufacture.index')->with('success', [
                'message' => 'Manufacture created successfully.',
            ]);
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['message' => 'Failed to create manufacture', 'error' => $e->getMessage()]);
        }
    }

    public function show(Manufacture $manufacture)
    {
        $this->authorize('view', $manufacture);

        return Inertia::render('manufacture/detail', [
            'manufacture' => new ManufactureResource($manufacture),
        ]);
    }

    public function edit(Manufacture $manufacture)
    {
        $this->authorize('update', $manufacture);

        return Inertia::render('manufacture/edit', [
            'manufacture' => new ManufactureResource($manufacture),
        ]);
    }

    public function update(ManufactureUpdateRequest $request, Manufacture $manufacture)
    {
        $this->authorize('update', $manufacture);

        try {
            $this->manufactureService->update($manufacture, $request->validated());

            return redirect()->route('manufacture.index')->with('success', [
                'message' => 'Manufacture updated successfully.',
            ]);
        } catch (\Throwable $e) {
            return redirect()->back()->withErrors(['message' => 'Failed to update manufacture', 'error' => $e->getMessage()]);
        }
    }

    public function destroy(Manufacture $manufacture)
    {
        $this->authorize('delete', $manufacture);

        try {
            $this->manufactureService->delete($manufacture);

            return redirect(url()->previous())->with('success', [
                'message' => 'Manufacture deleted successfully.',
            ]);
        } catch (\Throwable $e) {
            return redirect(url()->previous())->withErrors(['message' => 'Failed to delete manufacture', 'error' => $e->getMessage()]);
        }
    }
}
