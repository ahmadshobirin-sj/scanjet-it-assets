<?php

namespace App\Http\Services;

use App\Enums\AssetAssignmentAssetCondition;
use App\Enums\AssetAssignmentAssetStatus;
use App\Enums\AssetStatus;
use App\Exceptions\ClientException;
use App\Helpers\GenerateRefCode;
use App\Http\Tables\AssetAssignmentTable;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Tables\Traits\HasTable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AssetAsignmentService extends Service
{
    use HasTable;

    public function __construct(protected AssetAssignmentTable $assetAssignmentTable) {}

    public function attributes(): array
    {
        return Schema::getColumnListing((new AssetAssignment)->getTable());
    }

    /**
     * Get all assets.
     */
    public function getAll()
    {
        $query = $this->buildTable(AssetAssignment::class, $this->assetAssignmentTable);

        return $this->executeTableQuery($query);
    }

    public function getEmployees(Builder $query)
    {
        return $query->get();
    }

    public function getAssets(Builder $query)
    {
        return $query->get();
    }

    public function getAssetsByAssignment(Builder $query)
    {
        return $query->get();
    }

    public function assign(array $data): AssetAssignment
    {
        return DB::transaction(function () use ($data) {
            $asset_ids = $data['asset_ids'];
            $reference_code = GenerateRefCode::generate();
            $user_id = Auth::id();

            $assetsAlreadyAssigned = Asset::whereIn('id', $asset_ids)
                ->where('status', AssetStatus::ASSIGNED)
                ->exists();

            if ($assetsAlreadyAssigned) {
                throw new ClientException(
                    message: 'Failed to assign assets',
                    description: 'Some assets are already assigned. Please check the asset status.',
                );
            }

            $assignments = [
                'reference_code' => $reference_code,
                'assigned_user_id' => $data['assigned_user_id'],
                'assigned_at' => $data['assigned_at'],
                'notes' => $data['notes'],
                'user_id' => $user_id,
            ];

            $assignment = AssetAssignment::create(Arr::only($assignments, $this->attributes()));

            $assets = [];
            foreach ($asset_ids as $assetId) {
                $assets[$assetId] = [
                    'status' => AssetAssignmentAssetStatus::ASSIGNED,
                    'condition' => AssetAssignmentAssetCondition::OK,
                    'created_at' => now(),
                    'updated_at' => now(),
                    'returned_at' => null,
                ];
            }
            $assignment->assets()->attach($assets);

            Asset::whereIn('id', $asset_ids)->update([
                'status' => AssetStatus::ASSIGNED,
            ]);

            return $assignment;
        });
    }

    public function makeAssignmentMailPayload(AssetAssignment $assetAssignment): array
    {
        $data = [
            'reference_code' => $assetAssignment->reference_code,
            'assets' => $assetAssignment->assets->map(function ($asset) {
                return [
                    'id' => $asset->id,
                    'name' => $asset->name,
                    'serial_number' => $asset->serial_number,
                    'asset_tag' => $asset->asset_tag,
                    'status' => $asset->status,
                    'category' => [
                        'id' => $asset->category->id,
                        'name' => $asset->category->name,
                    ],
                    'manufacture' => [
                        'id' => $asset->manufacture->id,
                        'name' => $asset->manufacture->name,
                    ],
                ];
            })->toArray(),
            'assigned_user' => $assetAssignment->assignedUser->only(['id', 'name', 'email', 'job_title', 'office_location']),
            'assigned_at' => $assetAssignment->assigned_at->toIsoString(),
            'notes' => $assetAssignment['notes'] ?? null,
        ];

        return $data;
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

    public function confirmation(string $reference_code): AssetAssignment|bool
    {
        return DB::transaction(function () use ($reference_code) {
            $assetAssignment = $this->getByReferenceCode($reference_code);
            if (filled($assetAssignment->confirmed_at)) {
                return false;
            }
            $assetAssignment->confirmed_at = now();
            $assetAssignment->save();

            // TODO:
            // 1. Send notification to assigned user

            return $assetAssignment;
        });
    }
}
