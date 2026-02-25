<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Seed roles, permissions, and assign roles to existing users.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            // Admin permissions
            'view users',
            'create users',
            'edit users',
            'delete users',
            'view properties',
            'view reviews',

            // Agent permissions
            'view agent dashboard',
            'view analytics',
            'create properties',
            'edit properties',
            'delete properties',
            'view leads',
            'view notifications',
        ];

        foreach ($permissions as $permissionName) {
            Permission::firstOrCreate(['name' => $permissionName]);
        }

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $agentRole = Role::firstOrCreate(['name' => 'agent']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        $adminRole->syncPermissions([
            'view users',
            'create users',
            'edit users',
            'delete users',
            'view properties',
            'view reviews',
        ]);

        $agentRole->syncPermissions([
            'view agent dashboard',
            'view analytics',
            'view properties',
            'create properties',
            'edit properties',
            'delete properties',
            'view leads',
            'view notifications',
        ]);

        $userRole->syncPermissions([
            'view properties',
            'view reviews',
            'view notifications',
        ]);

        // Assign admin role
        User::query()
            ->where('email', 'admin@test.com')
            ->get()
            ->each(function (User $user): void {
                $user->syncRoles(['admin']);
            });

        // Assign agent role to all users marked as agent in the legacy role column
        User::query()
            ->where('role', 'agent')
            ->get()
            ->each(function (User $user): void {
                $user->syncRoles(['agent']);
            });

        // Assign user role to all remaining non-admin/non-agent users
        User::query()
            ->whereNotIn('role', ['admin', 'agent'])
            ->get()
            ->each(function (User $user): void {
                $user->syncRoles(['user']);
            });
    }
}
