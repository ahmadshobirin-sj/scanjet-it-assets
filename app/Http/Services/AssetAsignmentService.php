<?php

namespace App\Http\Services;

use App\Enums\AssetStatus;
use App\Helpers\GenerateRefCode;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Tables\AssetAssignmentTable;
use App\Tables\Traits\HasTable;
use Illuminate\Database\Eloquent\Builder;
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
        return $query->where('status', AssetStatus::AVAILABLE)->get();
    }

    public function assign(array $data): AssetAssignment
    {
        return DB::transaction(function () use ($data) {
            $asset_ids = $data['asset_ids'];
            $reference_code = GenerateRefCode::generate();
            $user_id = Auth::id();

            // Cek duplikasi
            $assetsAlreadyAssigned = Asset::whereIn('id', $asset_ids)
                ->where('status', AssetStatus::ASSIGNED)
                ->exists();

            if ($assetsAlreadyAssigned) {
                throw new \Exception('Some assets are already assigned to this user.');
            }

            $assignments = [
                'reference_code' => $reference_code,
                'assigned_user_id' => $data['assigned_user_id'],
                'assigned_at' => $data['assigned_at'],
                'notes' => $data['notes'],
                'user_id' => $user_id,
            ];

            $assignment = AssetAssignment::create(Arr::only($assignments, $this->attributes()));

            $assignment->assets()->attach($asset_ids);

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

    public function getByReferenceCode(string $reference_code): AssetAssignment
    {
        return AssetAssignment::where('reference_code', $reference_code)->firstOrFail();
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
