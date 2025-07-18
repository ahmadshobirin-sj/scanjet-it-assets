<?php

namespace App\Http\Services;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Tables\AssetTable;
use App\Tables\Traits\HasTable;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AssetService extends Service
{
    use HasTable;

    public function __construct(protected AssetTable $assetTable) {}

    /**
     * Get all assets.
     */
    public function getAll()
    {
        $query = $this->buildTable(Asset::class, $this->assetTable);
        return $this->executeTableQuery($query);
    }

    /**
     * Store a new asset.
     */
    public function store(array $data)
    {
        return DB::transaction(function () use ($data) {
            $data['status'] = AssetStatus::AVAILABLE;
            $asset = Asset::create(Arr::only($data, $this->attributes()));

            return $asset;
        });
    }

    /**
     * Find an asset by ID.
     */
    public function find(string $id): ?Asset
    {
        return Asset::findOrFail($id);
    }

    /**
     * Update an existing asset.
     */
    public function update(Asset $asset, array $data)
    {
        return DB::transaction(function () use ($asset, $data) {
            $asset->update(Arr::only($data, $this->attributes()));

            return $asset;
        });
    }

    /**
     * Delete an asset.
     */
    public function delete(Asset $asset)
    {
        return DB::transaction(function () use ($asset) {
            $asset->delete();
        });
    }

    public function attributes(): array
    {
        return Schema::getColumnListing((new Asset)->getTable());
    }
}
