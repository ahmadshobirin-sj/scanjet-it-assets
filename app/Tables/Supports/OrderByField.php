<?php

namespace App\Tables\Supports;

use Illuminate\Database\Connection;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

/**
 * OrderByField
 * ------------
 * Helper portable untuk custom ordering berdasarkan urutan nilai tertentu:
 *  - MySQL: FIELD(column, ?, ?, ?) ASC|DESC
 *  - PG/SQLite/SQLSrv: CASE WHEN column = ? THEN 0 ... ELSE 999999 END ASC|DESC
 *
 * Catatan:
 * - Type hint pakai Illuminate\Database\Connection (bukan ConnectionInterface) agar
 *   intelephense tidak protes "Undefined method getDriverName".
 * - Ada fallback driver detection via config/PDO kalaupun method tidak tersedia.
 */
class OrderByField
{
    /**
     * Terapkan ORDER BY berdasarkan urutan $ids untuk kolom $qualifiedColumn.
     * Semua nilai dibinding (aman).
     */
    public static function apply(EloquentBuilder $query, string $qualifiedColumn, array $ids, string $direction = 'asc'): EloquentBuilder
    {
        $ids = array_values(array_filter($ids, static fn ($v) => $v !== null && $v !== '', ARRAY_FILTER_USE_BOTH));
        if (empty($ids)) {
            return $query;
        }

        $direction = strtolower($direction) === 'desc' ? 'desc' : 'asc';

        [$sql, $bindings] = self::build($query->getConnection(), $qualifiedColumn, $ids, $direction);

        // Laravel modern mendukung bindings sebagai argumen kedua
        return $query->orderByRaw($sql, $bindings);
    }

    /**
     * Bangun fragmen SQL + bindings sesuai driver.
     *
     * @return array{0:string,1:array<int,mixed>}
     */
    public static function build(Connection $conn, string $qualifiedColumn, array $ids, string $direction = 'asc'): array
    {
        $direction = strtolower($direction) === 'desc' ? 'DESC' : 'ASC';

        // Deteksi driver yang robust: getDriverName() → config('driver') → PDO ATTR_DRIVER_NAME
        $driver = method_exists($conn, 'getDriverName')
            ? $conn->getDriverName()
            : ($conn->getConfig('driver') ?? ($conn->getPdo()?->getAttribute(\PDO::ATTR_DRIVER_NAME) ?? 'mysql'));

        if ($driver === 'mysql') {
            // Gunakan FIELD pada MySQL
            $placeholders = implode(',', array_fill(0, count($ids), '?'));
            $sql = "FIELD({$qualifiedColumn}, {$placeholders}) {$direction}";

            return [$sql, $ids];
        }

        // CASE WHEN untuk PG/SQLite/SQLSrv
        $bindings = [];
        $cases = [];
        foreach ($ids as $idx => $val) {
            $cases[] = "WHEN {$qualifiedColumn} = ? THEN {$idx}";
            $bindings[] = $val;
        }
        $elseRank = count($ids) + 999999;
        $sql = '(CASE '.implode(' ', $cases)." ELSE {$elseRank} END) {$direction}";

        return [$sql, $bindings];
    }
}
