<?php

namespace App\Http\Services;

use App\Enums\AssetStatus;
use App\Models\Asset;
use App\Models\AssetAssignment;
use App\Tables\AssetAssignmentTable;
use App\Tables\Traits\HasTable;
use Illuminate\Database\Eloquent\Builder;
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

    public function assign(array $data)
    {
        return DB::transaction(function () use ($data) {
            $asset_ids = $data['asset_ids'];
            $assignments = [];

            $user_id = Auth::id();

            foreach ($asset_ids as $asset_id) {
                $assignment = AssetAssignment::create([
                    'assigned_user_id' => $data['assigned_user_id'],
                    'asset_id' => $asset_id,
                    'assigned_at' => $data['assigned_at'],
                    'notes' => $data['notes'],
                    'user_id' => $user_id,
                ]);

                $assignments[] = $assignment;

                Asset::where('id', $asset_id)->update([
                    'status' => AssetStatus::ASSIGNED,
                ]);
            }

            return collect($assignments);
        });
    }
}
