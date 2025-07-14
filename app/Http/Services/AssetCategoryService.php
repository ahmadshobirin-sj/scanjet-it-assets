<?php

namespace App\Http\Services;

use App\Http\Filters\GlobalSearchFilter;
use App\Models\AssetCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class AssetCategoryService
{
    public function getAll(Request $request)
    {
        return QueryBuilder::for(AssetCategory::class)
            ->allowedFilters([
                AllowedFilter::custom('search', new GlobalSearchFilter()),
            ])
            ->allowedSorts([
                'name',
                'description',
                'created_at'
            ])
            ->defaultSort(['-created_at'])
            ->paginate($request->input('per_page', 10))
            ->appends($request->query());
    }

    public function create(array $data): AssetCategory
    {
        return DB::transaction(function () use ($data) {
            $assetCategory = AssetCategory::create(Arr::only($data, $this->attributes()));

            return $assetCategory;
        });
    }

    public function getById(string $id): AssetCategory
    {
        $assetCategory = QueryBuilder::for(AssetCategory::class)
            ->findOrFail($id);
        return $assetCategory;
    }

    public function update(AssetCategory $assetCategory, array $data): AssetCategory
    {
        return DB::transaction(function () use ($assetCategory, $data) {
            $assetCategory->update(Arr::only($data, $this->attributes()));

            return $assetCategory;
        });
    }

    public function delete(AssetCategory $assetCategory): void
    {
        DB::transaction(function () use ($assetCategory) {
            $assetCategory->delete();
        });
    }

    public function attributes(): array
    {
        return Schema::getColumnListing((new AssetCategory)->getTable());
    }
}
