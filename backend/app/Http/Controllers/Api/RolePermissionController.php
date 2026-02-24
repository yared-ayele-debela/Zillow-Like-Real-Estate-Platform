<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionController extends Controller
{
    public function roles()
    {
        $roles = Role::query()
            ->with('permissions:id,name,guard_name')
            ->orderBy('name')
            ->get();

        return response()->json($roles);
    }

    public function showRole(string $id)
    {
        $role = Role::query()
            ->with('permissions:id,name,guard_name')
            ->findOrFail($id);

        return response()->json($role);
    }

    public function storeRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'guard_name' => 'sometimes|string|max:50',
            'permissions' => 'sometimes|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $guard = $request->input('guard_name', config('auth.defaults.guard', 'web'));

        $role = Role::create([
            'name' => $request->name,
            'guard_name' => $guard,
        ]);

        if ($request->filled('permissions')) {
            $permissionIds = Permission::query()
                ->whereIn('id', $request->permissions)
                ->where('guard_name', $guard)
                ->pluck('id')
                ->all();

            $role->syncPermissions($permissionIds);
        }

        $this->resetPermissionCache();

        return response()->json($role->load('permissions:id,name,guard_name'), 201);
    }

    public function updateRole(Request $request, string $id)
    {
        $role = Role::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100|unique:roles,name,' . $role->id . ',id,guard_name,' . $role->guard_name,
            'permissions' => 'sometimes|array',
            'permissions.*' => 'integer|exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $role->name = $request->name;
            $role->save();
        }

        if ($request->has('permissions')) {
            $permissionIds = Permission::query()
                ->whereIn('id', $request->permissions)
                ->where('guard_name', $role->guard_name)
                ->pluck('id')
                ->all();

            $role->syncPermissions($permissionIds);
        }

        $this->resetPermissionCache();

        return response()->json($role->fresh()->load('permissions:id,name,guard_name'));
    }

    public function deleteRole(string $id)
    {
        $role = Role::findOrFail($id);

        $columnNames = config('permission.column_names');
        $pivotRole = $columnNames['role_pivot_key'] ?? 'role_id';
        $modelHasRolesTable = config('permission.table_names.model_has_roles', 'model_has_roles');
        $assignedCount = DB::table($modelHasRolesTable)
            ->where($pivotRole, $role->id)
            ->count();

        if ($assignedCount > 0) {
            return response()->json([
                'message' => 'Cannot delete role that is assigned to users.',
            ], 422);
        }

        $role->delete();
        $this->resetPermissionCache();

        return response()->json(['message' => 'Role deleted']);
    }

    public function permissions()
    {
        $permissions = Permission::query()
            ->orderBy('name')
            ->get();

        return response()->json($permissions);
    }

    public function showPermission(string $id)
    {
        $permission = Permission::findOrFail($id);
        return response()->json($permission);
    }

    public function storePermission(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'guard_name' => 'sometimes|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $permission = Permission::create([
            'name' => $request->name,
            'guard_name' => $request->input('guard_name', config('auth.defaults.guard', 'web')),
        ]);

        $this->resetPermissionCache();

        return response()->json($permission, 201);
    }

    public function updatePermission(Request $request, string $id)
    {
        $permission = Permission::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:100|unique:permissions,name,' . $permission->id . ',id,guard_name,' . $permission->guard_name,
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('name')) {
            $permission->name = $request->name;
            $permission->save();
        }

        $this->resetPermissionCache();

        return response()->json($permission->fresh());
    }

    public function deletePermission(string $id)
    {
        $permission = Permission::findOrFail($id);
        $permission->delete();

        $this->resetPermissionCache();

        return response()->json(['message' => 'Permission deleted']);
    }

    public function syncRolePermissions(Request $request, string $id)
    {
        $role = Role::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'permission_ids' => 'required|array',
            'permission_ids.*' => 'integer|exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $permissionIds = Permission::query()
            ->whereIn('id', $request->permission_ids)
            ->where('guard_name', $role->guard_name)
            ->pluck('id')
            ->all();

        $role->syncPermissions($permissionIds);
        $this->resetPermissionCache();

        return response()->json([
            'message' => 'Role permissions synced',
            'role' => $role->fresh()->load('permissions:id,name,guard_name'),
        ]);
    }

    private function resetPermissionCache(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
