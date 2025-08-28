<?php

namespace App\Http\Services;

use App\Enums\AssetStatus;
use App\Exceptions\ClientException;
use App\Models\Asset;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AssetService extends Service
{
    public function __construct(protected MediaLibraryService $mediaLibraryService) {}

    /**
     * Store a new asset.
     */
    public function store(array $data)
    {
        return DB::transaction(function () use ($data) {
            $data['status'] = AssetStatus::AVAILABLE;
            $asset = Asset::create(Arr::only($data, $this->attributes()));

            $this->mediaLibraryService->linkByMediaIds(Asset::class, $asset->id, $data['po_attachments'], 'po');

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

            $ids = $data['po_attachments'] ?? [];

            $this->mediaLibraryService->syncLinksByMediaIds(
                Asset::class,
                (string) $asset->id,
                $ids,
                'po',
                false
            );

            return $asset;
        });
    }

    /**
     * Delete an asset.
     */
    public function delete(Asset $asset)
    {
        return DB::transaction(function () use ($asset) {
            if ($asset->assignments()->exists()) {
                throw new ClientException('Asset cannot be deleted because it is assigned to an assignment.');
            }

            $asset->delete();
        });
    }

    public function attributes(): array
    {
        return Schema::getColumnListing((new Asset)->getTable());
    }
}
