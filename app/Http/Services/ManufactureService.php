<?php

namespace App\Http\Services;

use App\Http\Filters\GlobalSearchFilter;
use App\Models\Manufacture;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ManufactureService
{
    public function getAll()
    {
        return QueryBuilder::for(Manufacture::class)
            ->allowedFilters([
                AllowedFilter::custom('search', new GlobalSearchFilter),
                'name',
            ])
            ->allowedSorts([
                'name',
                'email',
                'phone',
                'address',
                'website',
                'contact_person_name',
                'contact_person_email',
                'contact_person_phone',
                'created_at',
            ])
            ->defaultSort(['-created_at'])
            ->paginate(request()->input('per_page', 10))
            ->appends(request()->query());
    }

    public function create(array $data): Manufacture
    {
        return DB::transaction(function () use ($data) {
            $manufacture = Manufacture::create(Arr::only($data, $this->attributes()));

            return $manufacture;
        });
    }

    public function getById(string $id): Manufacture
    {
        $manufacture = QueryBuilder::for(Manufacture::class)
            ->findOrFail($id);

        return $manufacture;
    }

    public function update(Manufacture $manufacture, array $data): Manufacture
    {
        return DB::transaction(function () use ($manufacture, $data) {
            $manufacture->update(Arr::only($data, $this->attributes()));

            return $manufacture;
        });
    }

    public function delete(Manufacture $manufacture): void
    {
        DB::transaction(function () use ($manufacture) {
            $manufacture->delete();
        });
    }

    public function attributes(): array
    {
        return Schema::getColumnListing((new Manufacture)->getTable());
    }
}
