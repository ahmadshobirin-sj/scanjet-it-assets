<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use ReflectionClass;
use ReflectionMethod;

class SetupAuth extends Command
{
    protected $signature = 'auth:setup {--guard=web : The guard name for permissions and roles}';

    protected $description = 'Setup complete authentication system: sync permissions from policies, roles, and create super admin user';

    public function handle()
    {
        $policyPath = app_path('Policies');
        if (! is_dir($policyPath)) {
            $this->error("Policy directory not found at {$policyPath}");

            return 1;
        }

        $guardName = $this->option('guard');

        $this->info('🔄 Scanning policy files...');
        $newPermissions = $this->extractPermissionsFromPolicies($policyPath);

        $this->info('📊 Syncing permissions...');
        $permissionStats = $this->syncPermissions($newPermissions, $guardName);

        $this->info('👥 Syncing roles...');
        $roleStats = $this->syncRoles($guardName);

        $this->info('🔗 Assigning permissions to Super Admin...');
        $this->assignPermissionsToSuperAdmin($guardName);

        $this->info('👤 Creating/updating super admin user...');
        $this->createSuperAdminUser();

        $this->displayResults($permissionStats, $roleStats);

        return 0;
    }

    private function extractPermissionsFromPolicies(string $policyPath): array
    {
        $files = scandir($policyPath);
        $permissions = [];

        foreach ($files as $file) {
            if (! Str::endsWith($file, 'Policy.php')) {
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
            // Bulk insert new permissions
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

            // Bulk delete removed permissions
            if (! empty($toDelete)) {
                Permission::where('guard_name', $guardName)
                    ->whereIn('name', $toDelete)
                    ->delete();
                $stats['deleted'] = count($toDelete);
            }
        });

        return $stats;
    }

    private function syncRoles(string $guardName): array
    {
        $roleNames = array_column(UserRole::cases(), 'value');
        $existingRoles = Role::where('guard_name', $guardName)
            ->pluck('name')
            ->toArray();

        $toInsert = array_diff($roleNames, $existingRoles);
        $toDelete = array_diff($existingRoles, $roleNames);

        $stats = [
            'inserted' => 0,
            'deleted' => 0,
            'existing' => count(array_intersect($roleNames, $existingRoles)),
        ];

        DB::transaction(function () use ($toInsert, $toDelete, $guardName, &$stats) {
            // Create new roles using Eloquent model
            foreach ($toInsert as $roleName) {
                Role::create([
                    'name' => $roleName,
                    'guard_name' => $guardName,
                ]);
                $stats['inserted']++;
            }

            // Bulk delete removed roles
            if (! empty($toDelete)) {
                Role::where('guard_name', $guardName)
                    ->whereIn('name', $toDelete)
                    ->delete();
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

        // Sync all permissions to Super Admin role
        $superAdminRole->syncPermissions($allPermissions);

        $this->info("   ✅ Assigned {$allPermissions->count()} permissions to Super Admin role");
    }

    private function createSuperAdminUser(): void
    {
        $email = env('EMAIL_ADMINISTRATOR');

        if (! $email) {
            $this->error('Super Admin email not set in .env file (EMAIL_ADMINISTRATOR)');

            return;
        }

        $user = User::firstOrCreate(
            ['email' => $email],
            ['email' => $email]
        );

        // Assign Super Admin role
        $user->syncRoles([UserRole::SUPER_ADMIN->value]);

        if ($user->wasRecentlyCreated) {
            $this->info("   ✅ Created new super admin user: {$email}");
        } else {
            $this->info("   ✅ Updated existing super admin user: {$email}");
        }
    }

    private function displayResults(array $permissionStats, array $roleStats): void
    {
        $this->info('');
        $this->info('📈 Synchronization Results:');
        $this->info('');

        $this->info('🔐 Permissions:');
        $this->line("   ✅ Added: {$permissionStats['inserted']} permissions");
        $this->line("   ❌ Removed: {$permissionStats['deleted']} permissions");
        $this->line("   ⚡ Existing: {$permissionStats['existing']} permissions");

        $this->info('');
        $this->info('👥 Roles:');
        $this->line("   ✅ Added: {$roleStats['inserted']} roles");
        $this->line("   ❌ Removed: {$roleStats['deleted']} roles");
        $this->line("   ⚡ Existing: {$roleStats['existing']} roles");

        $this->info('');
        $this->info('🎉 Permission & Role sync completed successfully!');

        if (
            $permissionStats['inserted'] === 0 && $permissionStats['deleted'] === 0 &&
            $roleStats['inserted'] === 0 && $roleStats['deleted'] === 0
        ) {
            $this->info('✨ All permissions and roles are already up to date!');
        }
    }
}
