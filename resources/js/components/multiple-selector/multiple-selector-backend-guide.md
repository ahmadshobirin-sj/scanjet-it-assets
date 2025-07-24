# Multiple Selector dengan Data Backend - Panduan Lengkap

## Overview

Multiple Selector sekarang mendukung transformasi data dari backend secara otomatis menggunakan `optionTransformer` dan `selectedTransformer`. Ini memungkinkan Anda untuk:

1. **Mengirim data mentah dari backend** tanpa perlu mentransformasi di frontend terlebih dahulu
2. **Menambahkan custom rendering** (avatar, icon, badge) secara otomatis
3. **Memisahkan logic data dan UI** untuk maintainability yang lebih baik

## Cara Kerja Transformer

### 1. **optionTransformer**

Mengubah data backend menjadi `Option` dengan custom rendering untuk dropdown options.

### 2. **selectedTransformer**

Mengubah data backend menjadi `Option` dengan custom rendering untuk selected badges.

## Contoh Implementasi

### 1. Data User dari Backend

```typescript
// Data dari backend API
interface BackendUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    status: 'online' | 'offline' | 'busy';
    department: string;
}

// Transformer function
const userTransformer = (user: BackendUser): Option => ({
    value: user.id.toString(),
    label: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    department: user.department,
    avatar: user.avatar,

    // Custom option rendering
    optionContent: (option: Option) => (
        <div className="flex items-center gap-3 py-2">
            <div className="relative">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                    user.status === 'online' ? 'bg-green-500' :
                    user.status === 'busy' ? 'bg-red-500' : 'bg-gray-400'
                }`} />
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{user.name}</div>
                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                <div className="text-xs text-blue-600">{user.role} • {user.department}</div>
            </div>
        </div>
    ),

    // Custom badge rendering
    badgeElement: ({ option, onRemove, disabled, fixed }) => (
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-2 py-1 rounded-full text-sm">
            <Avatar className="h-5 w-5">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
            </Avatar>
            <span className="text-gray-700 truncate">{user.name}</span>
            {!disabled && !fixed && (
                <button onClick={onRemove} className="ml-1 hover:bg-red-100 rounded-full p-0.5">
                    <X className="h-3 w-3 text-red-500" />
                </button>
            )}
        </div>
    )
});

// Penggunaan dengan async search
<MultipleSelector
    placeholder="Search users..."
    onSearch={async (query) => {
        const response = await fetch(`/api/users/search?q=${query}`);
        const users: BackendUser[] = await response.json();
        return users as any[]; // Return raw backend data
    }}
    optionTransformer={userTransformer}
    selectedTransformer={userTransformer}
    onChange={(selectedUsers) => {
        console.log('Selected users:', selectedUsers);
    }}
/>
```

### 2. Data Department dari Backend

```typescript
interface BackendDepartment {
    id: number;
    name: string;
    description: string;
    manager: string;
    location: string;
    employee_count: number;
    budget: number;
    color: string;
    icon: string;
}

const departmentTransformer = (dept: BackendDepartment): Option => ({
    value: dept.id.toString(),
    label: dept.name,
    description: dept.description,
    manager: dept.manager,
    location: dept.location,
    employee_count: dept.employee_count,
    budget: dept.budget,
    color: dept.color,
    icon: dept.icon,

    optionContent: (option: Option) => (
        <div className="flex items-center gap-3 py-2">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: dept.color }}
            >
                {dept.icon}
            </div>
            <div className="flex-1">
                <div className="font-medium text-sm">{dept.name}</div>
                <div className="text-xs text-muted-foreground">{dept.description}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                    <span>Manager: {dept.manager}</span>
                    <span>{dept.location}</span>
                </div>
                <div className="text-xs text-blue-600 mt-1">
                    {dept.employee_count} employees • Budget: ${dept.budget.toLocaleString()}
                </div>
            </div>
        </div>
    ),

    badgeContent: (option: Option) => (
        <div className="flex items-center gap-1.5">
            <span style={{ color: dept.color }}>{dept.icon}</span>
            <span>{dept.name}</span>
        </div>
    )
});

// Penggunaan dengan static options
<MultipleSelector
    placeholder="Select departments..."
    defaultOptions={departmentsFromBackend as any[]} // Raw backend data
    optionTransformer={departmentTransformer}
    selectedTransformer={departmentTransformer}
/>
```

### 3. Integrasi dengan Laravel Backend

```php
// Laravel Controller
class UserController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->get('q', '');

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->with(['department', 'role'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar_url,
                    'role' => $user->role->name,
                    'status' => $user->status,
                    'department' => $user->department->name,
                ];
            });

        return response()->json($users);
    }
}
```

```typescript
// Frontend integration
const searchUsers = async (query: string) => {
    const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search users');
    return response.json();
};

<MultipleSelector
    placeholder="Search users..."
    onSearch={searchUsers}
    optionTransformer={userTransformer}
    selectedTransformer={userTransformer}
    delay={300} // Debounce untuk mengurangi API calls
/>
```

## Keuntungan Menggunakan Transformer

### 1. **Separation of Concerns**

- Backend fokus pada data
- Frontend fokus pada UI/UX
- Transformer sebagai bridge

### 2. **Reusability**

```typescript
// Satu transformer bisa digunakan di multiple places
const userTransformer = createUserTransformer();

// Di halaman user management
<MultipleSelector optionTransformer={userTransformer} />

// Di halaman project assignment
<MultipleSelector optionTransformer={userTransformer} />

// Di halaman team creation
<MultipleSelector optionTransformer={userTransformer} />
```

### 3. **Type Safety**

```typescript
// Buat generic transformer factory
function createTransformer<T>(transformer: (item: T) => Option): (item: T) => Option {
    return transformer;
}

const userTransformer = createTransformer<BackendUser>((user) => ({
    value: user.id.toString(),
    label: user.name,
    // ... rest of transformation
}));
```

### 4. **Easy Testing**

```typescript
// Test transformer secara terpisah
describe('userTransformer', () => {
    it('should transform backend user to option', () => {
        const backendUser: BackendUser = {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Admin',
            status: 'online',
            department: 'Engineering',
        };

        const option = userTransformer(backendUser);

        expect(option.value).toBe('1');
        expect(option.label).toBe('John Doe');
        expect(option.optionContent).toBeDefined();
        expect(option.badgeElement).toBeDefined();
    });
});
```

## Best Practices

### 1. **Caching Transformer Results**

```typescript
const memoizedTransformer = useMemo(() => (user: BackendUser) => userTransformer(user), []);
```

### 2. **Error Handling**

```typescript
const safeTransformer = (user: BackendUser): Option => {
    try {
        return userTransformer(user);
    } catch (error) {
        console.error('Transform error:', error);
        return {
            value: user.id?.toString() || 'unknown',
            label: user.name || 'Unknown User',
        };
    }
};
```

### 3. **Conditional Rendering**

```typescript
const conditionalTransformer = (user: BackendUser): Option => ({
    value: user.id.toString(),
    label: user.name,

    optionContent: (option: Option) => (
        <div className="flex items-center gap-3 py-2">
            {user.avatar && (
                <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
            )}
            <div>
                <div className="font-medium">{user.name}</div>
                {user.email && (
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                )}
            </div>
        </div>
    )
});
```

## Migration dari Versi Lama

Jika Anda sudah menggunakan MultipleSelector sebelumnya:

```typescript
// Versi lama - manual transformation
const [options, setOptions] = useState<Option[]>([]);

useEffect(() => {
    fetchUsers().then(users => {
        const transformedOptions = users.map(user => ({
            value: user.id.toString(),
            label: user.name,
            // manual custom rendering...
        }));
        setOptions(transformedOptions);
    });
}, []);

<MultipleSelector options={options} />

// Versi baru - automatic transformation
<MultipleSelector
    onSearch={fetchUsers} // Return raw backend data
    optionTransformer={userTransformer} // Auto transform
/>
```

Dengan transformer functions, Anda bisa dengan mudah mengintegrasikan data backend dengan custom UI rendering tanpa perlu manual transformation di setiap tempat penggunaan.
