<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\Permission;
use App\Models\Role;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use ReflectionClass;
use ReflectionMethod;

class SyncPermissionsAndRoles extends Command
{
    protected $signature = 'permissions:sync';

    protected $description = 'Sync all permissions from policies and assign all permissions to Super Admin role';

    public function handle()
    {
        $policyPath = app_path('Policies');
        if (! is_dir($policyPath)) {
            $this->error("Policy directory not found at {$policyPath}");

            return 1;
        }

        // Ambil guard default dari config
        $guardName = config('auth.defaults.guard', 'web');

        $this->info('🔄 Scanning policy files...');
        $newPermissions = $this->extractPermissionsFromPolicies($policyPath);

        $this->info('📊 Syncing permissions...');
        $permissionStats = $this->syncPermissions($newPermissions, $guardName);

        $this->info('🔗 Assigning permissions to Super Admin...');
        $this->assignPermissionsToSuperAdmin($guardName);

        $this->displayResults($permissionStats);

        return 0;
    }

    private function extractPermissionsFromPolicies(string $policyPath): array
    {
        $files = scandir($policyPath);
        $permissions = [];

        foreach ($files as $file) {
            if (! str_ends_with($file, 'Policy.php')) {
                continue;
            }

            $className = 'App\\Policies\\'.Str::before($file, '.php');

            if (! class_exists($className)) {
                require_once $policyPath.'/'.$file;
            }

            $reflect = new ReflectionClass($className);
            $model = Str::snake(str_replace('Policy', '', $reflect->getShortName()));

            foreach ($reflect->getMethods(ReflectionMethod::IS_PUBLIC) as $method) {
                if ($method->getFileName() !== $reflect->getFileName()) {
                    continue;
                }
                if (Str::startsWith($method->name, '__')) {
                    continue;
                }
                $permissions[] = "{$model}.{$method->name}";
            }
        }

        return array_unique($permissions);
    }

    private function syncPermissions(array $newPermissions, string $guardName): array
    {
        $existingPermissions = Permission::where('guard_name', $guardName)
            ->pluck('name')
            ->toArray();

        $toInsert = array_diff($newPermissions, $existingPermissions);
        $toDelete = array_diff($existingPermissions, $newPermissions);

        $stats = [
            'inserted' => 0,
            'deleted' => 0,
            'existing' => count(array_intersect($newPermissions, $existingPermissions)),
        ];

        DB::transaction(function () use ($toInsert, $toDelete, $guardName, &$stats) {
            // Insert permission baru
            if (! empty($toInsert)) {
                $insertData = array_map(function ($permission) use ($guardName) {
                    return [
                        'id' => Str::uuid()->toString(),
                        'name' => $permission,
                        'guard_name' => $guardName,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }, $toInsert);

                DB::table('permissions')->insert($insertData);
                $stats['inserted'] = count($toInsert);
            }

            // Hapus permission yang sudah tidak ada di policy
            if (! empty($toDelete)) {
                $permissions = Permission::where('guard_name', $guardName)
                    ->whereIn('name', $toDelete)
                    ->get();

                foreach ($permissions as $permission) {
                    // Lepas dari semua role
                    $permission->roles()->detach();
                    // Lepas dari semua user
                    $permission->users()->detach();
                    // Hapus permission
                    $permission->delete();
                }

                $stats['deleted'] = count($toDelete);
            }
        });

        return $stats;
    }

    private function assignPermissionsToSuperAdmin(string $guardName): void
    {
        $superAdminRole = Role::where('name', UserRole::SUPER_ADMIN->value)
            ->where('guard_name', $guardName)
            ->first();

        if (! $superAdminRole) {
            $this->error('Super Admin role not found!');

            return;
        }

        $allPermissions = Permission::where('guard_name', $guardName)->get();
        $superAdminRole->syncPermissions($allPermissions);

        $this->info("   ✅ Assigned {$allPermissions->count()} permissions to Super Admin role");
    }

    private function displayResults(array $permissionStats): void
    {
        $this->info('');
        $this->info('📈 Synchronization Results:');
        $this->info('');

        $this->info('🔐 Permissions:');
        $this->line("   ✅ Added: {$permissionStats['inserted']} permissions");
        $this->line("   ❌ Removed: {$permissionStats['deleted']} permissions");
        $this->line("   ⚡ Existing: {$permissionStats['existing']} permissions");

        $this->info('');
        $this->info('🎉 Permissions synced & assigned to Super Admin successfully!');
    }
}
