<?php

namespace App\Http\Tables;

use App\Models\AssetReturn;
use App\Tables\Columns\Column;
use App\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Spatie\QueryBuilder\QueryBuilder;

class AssignmentReturnLogTable extends Table
{
    private string $asset_assignment_id;

    public function __construct(string $name, string $asset_assignment_id)
    {
        $this->asset_assignment_id = $asset_assignment_id;
        parent::__construct($name);
    }

    public static function make(?string $name = null, ?string $asset_assignment_id = null): static
    {
        return new static($name, $asset_assignment_id);
    }

    public function resource(): Builder|string
    {
        return AssetReturn::class;
    }

    public function columns(): array
    {
        return [
            Column::make('received_by.email')
                ->label('Received By')
                ->globallySearchable()
                ->toggleable(),
            Column::make('returned_at')
                ->sortable()
                ->globallySearchable()
                ->toggleable(),
        ];
    }

    public function filters(): array
    {
        return [];
    }

    public function with(): array
    {
        return ['received_by:id,name,email,job_title,office_location', 'assignment:id,reference_code', 'assets'];
    }

    public function defaultSort(): array
    {
        return ['-returned_at'];
    }

    protected function customizeQuery(QueryBuilder $query): QueryBuilder
    {
        $query->where('asset_assignment_id', $this->asset_assignment_id);

        return $query;
    }
}
