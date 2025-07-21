<?php

namespace App\Http\Filters;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOneOrMany;
use Illuminate\Database\Eloquent\Relations\Relation;
use Spatie\QueryBuilder\Sorts\Sort;

class NestedRelationSort implements Sort
{
    public function __invoke(Builder $query, bool $descending, string $property)
    {
        $parts = explode('.', $property);

        // Sorting kolom langsung (tanpa relasi)
        if (count($parts) === 1) {
            $column = $parts[0];
            $mainTable = $query->getModel()->getTable();
            $query->orderBy("{$mainTable}.{$column}", $descending ? 'desc' : 'asc');

            return;
        }

        $relationPath = implode('.', array_slice($parts, 0, -1));
        $column = end($parts);
        $alias = $this->generateAlias($relationPath);
        $model = $query->getModel();
        $relation = $this->resolveRelation($model, $relationPath);

        if (! $relation) {
            return;
        }

        $relatedModel = $relation->getRelated();
        $relatedTable = $relatedModel->getTable();
        $mainTable = $model->getTable();

        // Optimasi: gunakan subquery untuk BelongsTo
        if ($relation instanceof BelongsTo) {
            $foreignKey = $relation->getForeignKeyName();
            $ownerKey = $relation->getOwnerKeyName();

            $query->orderByRaw("(
                SELECT {$relatedTable}.{$column}
                FROM {$relatedTable}
                WHERE {$relatedTable}.{$ownerKey} = {$mainTable}.{$foreignKey}
            ) ".($descending ? 'DESC' : 'ASC'));

            return;
        }

        // Selain BelongsTo, tetap gunakan join
        if (! $this->isAlreadyJoined($query, $alias, $relatedTable)) {
            $this->applyJoin($query, $relation, $alias);
        }

        $query->orderBy("{$alias}.{$column}", $descending ? 'desc' : 'asc');
    }

    protected function generateAlias(string $relationPath): string
    {
        return str_replace('.', '_', $relationPath);
    }

    protected function resolveRelation($model, string $relationPath): ?Relation
    {
        $relations = explode('.', $relationPath);
        $currentModel = $model;

        try {
            foreach ($relations as $relationName) {
                if (! method_exists($currentModel, $relationName)) {
                    return null;
                }

                $relation = $currentModel->$relationName();
                $currentModel = $relation->getRelated();
            }

            return $relation;
        } catch (\Exception $e) {
            return null;
        }
    }

    protected function isAlreadyJoined(Builder $query, string $alias, string $table): bool
    {
        $joins = $query->getQuery()->joins ?? [];

        return collect($joins)->contains(function ($join) use ($alias, $table) {
            return $join->table === "{$table} as {$alias}" || $join->table === $alias;
        });
    }

    protected function applyJoin(Builder $query, Relation $relation, string $alias): void
    {
        $relatedTable = $relation->getRelated()->getTable();

        if ($relation instanceof HasOneOrMany) {
            $query->leftJoin(
                "{$relatedTable} as {$alias}",
                "{$alias}.".$relation->getForeignKeyName(),
                '=',
                $relation->getQualifiedParentKeyName()
            );
        } elseif ($relation instanceof BelongsToMany) {
            $query->leftJoin(
                "{$relatedTable} as {$alias}",
                $relation->getQualifiedForeignPivotKeyName(),
                '=',
                $relation->getQualifiedRelatedPivotKeyName()
            );
        }
    }
}
