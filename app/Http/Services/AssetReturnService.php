<?php

namespace App\Http\Services;

use App\DTOs\AssetReturnResult;
use App\Enums\AssetAssignmentAssetCondition;
use App\Exceptions\ClientException;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Models\AssetReturn;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AssetReturnService
{
    public function getAssets(Builder $query)
    {
        return $query->get();
    }

    public function getByReferenceCode(string $reference_code, array $with = []): AssetAssignment
    {
        try {
            $assetAssignment = AssetAssignment::where('reference_code', $reference_code)
                ->with($with)
                ->firstOrFail();

            return $assetAssignment;
        } catch (ModelNotFoundException $e) {
            throw new ClientException(
                message: 'Asset assignment not found',
                description: 'No asset assignment found with the provided reference code.',
            );
        }
    }

    /**
     * $data minimal:
     * [
     *   'returned_at'          => '2025-08-01 10:20:00' | null (default now)
     *   'notes'                => 'optional',
     *   'assets' => [
     *       ['asset_id' => 'uuid1', 'condition' => 'ok'],
     *       ['asset_id' => 'uuid2', 'condition' => 'damaged'],
     *   ],
     * ]
     */
    public function returnAssets(array $data, string $reference_code): AssetReturnResult
    {
        return DB::transaction(function () use ($data, $reference_code) {
            $assetKey = 'asset_id';
            $assetIds = array_values(array_unique(Arr::pluck($data['assets'] ?? [], $assetKey)));

            if (empty($assetIds)) {
                throw new ClientException('Failed to return assets', 'No assets provided.');
            }

            // 1) Ambil assignment
            $assignment = $this->getByReferenceCode($reference_code);

            // 2) Kunci baris pivot terkait untuk hindari race condition
            $pivotRows = DB::table('asset_assignment_has_assets')
                ->where('asset_assignment_id', $assignment->id)
                ->whereIn('asset_id', $assetIds)
                ->lockForUpdate()
                ->get(['asset_id', 'returned_at']);

            // Pastikan semua asset_ids memang termasuk assignment
            if ($pivotRows->count() !== count($assetIds)) {
                throw new ClientException(
                    'Failed to return assets',
                    'Some assets are not part of this assignment.'
                );
            }

            // Tolak jika ada yang sudah returned
            $alreadyReturned = $pivotRows->filter(fn ($r) => ! is_null($r->returned_at));
            if ($alreadyReturned->isNotEmpty()) {
                throw new ClientException(
                    'Failed to return assets',
                    'Some assets have already been returned.'
                );
            }

            // 3) Buat header return (asset_returns)
            $returnedAt = isset($data['returned_at']) ? Carbon::parse($data['returned_at']) : now();
            $return = AssetReturn::create([
                'asset_assignment_id' => $assignment->id,
                'received_by_user_id' => Auth::id(),
                'returned_at' => $returnedAt,
                'notes' => $data['notes'] ?? null,
            ]);

            // 4) Siapkan data sync pivot: set asset_return_id, returned_at, condition
            $map = [];
            foreach ($data['assets'] as $row) {
                $assetId = $row[$assetKey] ?? null;
                $condition = $row['condition'] ?? 'ok';

                // Validasi enum condition lebih awal
                try {
                    $condEnum = AssetAssignmentAssetCondition::from($condition);
                } catch (\ValueError $e) {
                    throw new ClientException('Invalid condition', "Condition '$condition' is not allowed.");
                }

                $map[$assetId] = [
                    'asset_return_id' => $return->id,
                    'returned_at' => $returnedAt->toDateTimeString(),
                    'condition' => $condEnum->value,
                    'updated_at' => now(),
                ];
            }

            // 5) Update pivot (tanpa melepas relasi lain)
            $assignment->assets()->syncWithoutDetaching($map);

            // 6) Update status global aset (batch per condition)
            $grouped = collect($data['assets'])->groupBy('condition');
            foreach ($grouped as $condition => $items) {
                // mapping ke status aset (pastikan method ini ada di enum kamu)
                $targetStatus = AssetAssignmentAssetCondition::syncWithAssetStatus(
                    AssetAssignmentAssetCondition::from($condition)
                );

                Asset::whereIn('id', Arr::pluck($items, $assetKey))
                    ->update(['status' => $targetStatus]);
            }

            // 7) Kalau semua item sudah kembali, set returned_at di assignment (pakai waktu header)
            if ($assignment->isFullyReturned()) {
                $assignment->update(['returned_at' => $returnedAt]);
            }

            return new AssetReturnResult(
                $assignment->fresh(['assets', 'returns', 'assignedBy']),
                $return->fresh('receivedBy'),
            );
        });
    }
}
