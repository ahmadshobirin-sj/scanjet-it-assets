import { MultipleSelector, Option } from '@/components/multiple-selector';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Head } from '@inertiajs/react';
import { Briefcase, Building2, Clock, Mail, MapPin, Star, User, Users, X } from 'lucide-react';
import { useState } from 'react';

// Mock data interfaces
interface BackendUser {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
    status: 'online' | 'offline' | 'busy';
    department: string;
    phone?: string;
    location?: string;
}

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

interface BackendProject {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'on-hold';
    priority: 'low' | 'medium' | 'high';
    team_size: number;
    deadline: string;
    progress: number;
}

// Mock data
const mockUsers: BackendUser[] = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@company.com',
        role: 'Senior Developer',
        status: 'online',
        department: 'Engineering',
        phone: '+1-555-0101',
        location: 'New York',
    },
    {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@company.com',
        role: 'Product Manager',
        status: 'busy',
        department: 'Product',
        phone: '+1-555-0102',
        location: 'San Francisco',
    },
    {
        id: 3,
        name: 'Bob Wilson',
        email: 'bob@company.com',
        role: 'UI/UX Designer',
        status: 'online',
        department: 'Design',
        phone: '+1-555-0103',
        location: 'Los Angeles',
    },
    {
        id: 4,
        name: 'Alice Brown',
        email: 'alice@company.com',
        role: 'DevOps Engineer',
        status: 'offline',
        department: 'Engineering',
        phone: '+1-555-0104',
        location: 'Seattle',
    },
    {
        id: 5,
        name: 'Charlie Davis',
        email: 'charlie@company.com',
        role: 'Data Analyst',
        status: 'online',
        department: 'Analytics',
        phone: '+1-555-0105',
        location: 'Chicago',
    },
    {
        id: 6,
        name: 'Diana Prince',
        email: 'diana@company.com',
        role: 'Marketing Specialist',
        status: 'busy',
        department: 'Marketing',
        phone: '+1-555-0106',
        location: 'Miami',
    },
    {
        id: 7,
        name: 'Ethan Hunt',
        email: 'ethan@company.com',
        role: 'Security Engineer',
        status: 'online',
        department: 'Security',
        phone: '+1-555-0107',
        location: 'Austin',
    },
    {
        id: 8,
        name: 'Fiona Green',
        email: 'fiona@company.com',
        role: 'HR Manager',
        status: 'offline',
        department: 'Human Resources',
        phone: '+1-555-0108',
        location: 'Boston',
    },
];

const mockDepartments: BackendDepartment[] = [
    {
        id: 1,
        name: 'Engineering',
        description: 'Software Development & Architecture',
        manager: 'John Smith',
        location: 'Building A, Floor 3',
        employee_count: 25,
        budget: 2500000,
        color: '#3B82F6',
        icon: '💻',
    },
    {
        id: 2,
        name: 'Product',
        description: 'Product Strategy & Management',
        manager: 'Sarah Johnson',
        location: 'Building A, Floor 2',
        employee_count: 12,
        budget: 1200000,
        color: '#10B981',
        icon: '📱',
    },
    {
        id: 3,
        name: 'Design',
        description: 'UI/UX Design & Research',
        manager: 'Mike Chen',
        location: 'Building B, Floor 1',
        employee_count: 8,
        budget: 800000,
        color: '#8B5CF6',
        icon: '🎨',
    },
    {
        id: 4,
        name: 'Marketing',
        description: 'Digital Marketing & Growth',
        manager: 'Lisa Wang',
        location: 'Building B, Floor 2',
        employee_count: 15,
        budget: 1500000,
        color: '#F59E0B',
        icon: '📈',
    },
    {
        id: 5,
        name: 'Sales',
        description: 'Business Development & Sales',
        manager: 'Tom Brown',
        location: 'Building C, Floor 1',
        employee_count: 20,
        budget: 1800000,
        color: '#EF4444',
        icon: '💼',
    },
    {
        id: 6,
        name: 'Analytics',
        description: 'Data Science & Business Intelligence',
        manager: 'Anna Lee',
        location: 'Building A, Floor 4',
        employee_count: 10,
        budget: 1000000,
        color: '#06B6D4',
        icon: '📊',
    },
];

const mockProjects: BackendProject[] = [
    {
        id: 1,
        name: 'Mobile App Redesign',
        description: 'Complete redesign of mobile application',
        status: 'active',
        priority: 'high',
        team_size: 8,
        deadline: '2024-03-15',
        progress: 65,
    },
    {
        id: 2,
        name: 'API Integration',
        description: 'Third-party API integration project',
        status: 'active',
        priority: 'medium',
        team_size: 5,
        deadline: '2024-02-28',
        progress: 40,
    },
    {
        id: 3,
        name: 'Database Migration',
        description: 'Legacy database migration to cloud',
        status: 'completed',
        priority: 'high',
        team_size: 6,
        deadline: '2024-01-31',
        progress: 100,
    },
    {
        id: 4,
        name: 'Security Audit',
        description: 'Comprehensive security assessment',
        status: 'on-hold',
        priority: 'high',
        team_size: 4,
        deadline: '2024-04-30',
        progress: 20,
    },
    {
        id: 5,
        name: 'Performance Optimization',
        description: 'Application performance improvements',
        status: 'active',
        priority: 'medium',
        team_size: 3,
        deadline: '2024-03-30',
        progress: 75,
    },
];

// Transformer functions
const userTransformer = (user: BackendUser): Option => ({
    value: user?.id?.toString() || `user-${Math.random()}`,
    label: user?.name || 'Unknown User',
    email: user?.email || '',
    role: user?.role || '',
    status: user?.status || 'offline',
    department: user?.department || '',
    phone: user?.phone || '',
    location: user?.location || '',

    optionContent: () => (
        <div className="flex items-center gap-3 py-2">
            <div className="relative">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-medium text-white">
                        {user?.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div
                    className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white ${
                        (user?.status || 'offline') === 'online'
                            ? 'bg-green-500'
                            : (user?.status || 'offline') === 'busy'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                    }`}
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{user?.name || ''}</div>
                <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {user?.email || ''}
                </div>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Briefcase className="h-3 w-3" />
                    {user?.role || ''}
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {user?.department || ''}
                    </span>
                    {user?.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {user.location}
                        </span>
                    )}
                </div>
            </div>
            <Badge
                variant="outline"
                size="sm"
                intent={(user?.status || 'offline') === 'online' ? 'success' : (user?.status || 'offline') === 'busy' ? 'warning' : 'secondary'}
            >
                {user?.status || 'offline'}
            </Badge>
        </div>
    ),

    badgeElement: ({ onRemove, disabled, fixed }) => (
        <div className="flex max-w-[250px] items-center gap-2 rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 px-3 py-1.5 text-sm">
            <div className="relative flex-shrink-0">
                <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xs text-white">
                        {user?.name
                            ?.split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase() || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div
                    className={`absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full border border-white ${
                        (user?.status || 'offline') === 'online'
                            ? 'bg-green-500'
                            : (user?.status || 'offline') === 'busy'
                              ? 'bg-yellow-500'
                              : 'bg-gray-400'
                    }`}
                />
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-gray-700">{user?.name || ''}</div>
                <div className="truncate text-xs text-gray-500">{user?.role || ''}</div>
            </div>
            {!disabled && !fixed && (
                <button onClick={onRemove} className="ml-1 flex-shrink-0 rounded-full p-1 transition-colors hover:bg-red-100">
                    <X className="h-3 w-3 text-red-500" />
                </button>
            )}
        </div>
    ),
});

const departmentTransformer = (dept: BackendDepartment): Option => ({
    value: dept?.id?.toString() || `dept-${Math.random()}`,
    label: dept?.name || 'Unknown Department',
    description: dept?.description || '',
    manager: dept?.manager || '',
    location: dept?.location || '',
    employee_count: dept?.employee_count || 0,
    budget: dept?.budget || 0,
    color: dept?.color || '#3B82F6',
    icon: dept?.icon || '🏢',

    optionContent: () => (
        <div className="flex items-center gap-3 py-3">
            <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white shadow-md"
                style={{ backgroundColor: dept?.color || '#3B82F6' }}
            >
                {dept?.icon || '🏢'}
            </div>
            <div className="flex-1">
                <div className="text-sm font-semibold">{dept?.name || ''}</div>
                <div className="mb-1 text-xs text-muted-foreground">{dept?.description || ''}</div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Manager: {dept?.manager || ''}
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {dept?.location || ''}
                    </span>
                </div>
                <div className="mt-1 flex items-center gap-4 text-xs text-blue-600">
                    <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {dept?.employee_count || 0} employees
                    </span>
                    <span>Budget: ${(dept?.budget || 0).toLocaleString()}</span>
                </div>
            </div>
        </div>
    ),

    badgeContent: () => (
        <div className="flex items-center gap-2">
            <span style={{ color: dept?.color || '#3B82F6', fontSize: '16px' }}>{dept?.icon || '🏢'}</span>
            <span className="font-medium">{dept?.name || ''}</span>
            <Badge variant="outline" size="sm">
                {dept?.employee_count || 0}
            </Badge>
        </div>
    ),
});

const projectTransformer = (project: BackendProject): Option => ({
    value: project?.id?.toString() || `project-${Math.random()}`,
    label: project?.name || 'Unknown Project',
    description: project?.description || '',
    status: project?.status || 'active',
    priority: project?.priority || 'medium',
    team_size: project?.team_size || 0,
    deadline: project?.deadline || '',
    progress: project?.progress || 0,

    optionContent: () => (
        <div className="flex items-center gap-3 py-2">
            <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg text-white ${
                    (project?.priority || 'medium') === 'high'
                        ? 'bg-red-500'
                        : (project?.priority || 'medium') === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                }`}
            >
                <Star className="h-5 w-5" />
            </div>
            <div className="flex-1">
                <div className="text-sm font-medium">{project?.name || ''}</div>
                <div className="text-xs text-muted-foreground">{project?.description || ''}</div>
                <div className="mt-1 flex items-center gap-4">
                    <Badge
                        variant="outline"
                        size="sm"
                        intent={
                            (project?.status || 'active') === 'active'
                                ? 'success'
                                : (project?.status || 'active') === 'completed'
                                  ? 'info'
                                  : 'warning'
                        }
                    >
                        {project?.status || 'active'}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {project?.team_size || 0} members
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {project?.deadline || ''}
                    </span>
                </div>
                <div className="mt-2">
                    <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-gray-200">
                            <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${project?.progress || 0}%` }} />
                        </div>
                        <span className="text-xs font-medium text-blue-600">{project?.progress || 0}%</span>
                    </div>
                </div>
            </div>
        </div>
    ),

    badgeContent: () => (
        <div className="flex items-center gap-2">
            <div
                className={`flex h-4 w-4 items-center justify-center rounded text-xs text-white ${
                    (project?.priority || 'medium') === 'high'
                        ? 'bg-red-500'
                        : (project?.priority || 'medium') === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                }`}
            >
                <Star className="h-2.5 w-2.5" />
            </div>
            <span>{project?.name || ''}</span>
            <Badge variant="light" size="sm" intent="info">
                {project?.progress || 0}%
            </Badge>
        </div>
    ),
});

export default function MultipleSelectorTest() {
    const [selectedUsers, setSelectedUsers] = useState<Option[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<Option[]>([]);
    const [selectedProjects, setSelectedProjects] = useState<Option[]>([]);

    // Simulate async search functions
    const searchUsers = async (query: string): Promise<BackendUser[]> => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return mockUsers.filter(
            (user) =>
                user.name.toLowerCase().includes(query.toLowerCase()) ||
                user.email.toLowerCase().includes(query.toLowerCase()) ||
                user.role.toLowerCase().includes(query.toLowerCase()) ||
                user.department.toLowerCase().includes(query.toLowerCase()),
        );
    };

    const searchDepartments = async (query: string): Promise<BackendDepartment[]> => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockDepartments.filter(
            (dept) =>
                dept.name.toLowerCase().includes(query.toLowerCase()) ||
                dept.description.toLowerCase().includes(query.toLowerCase()) ||
                dept.manager.toLowerCase().includes(query.toLowerCase()),
        );
    };

    const searchProjects = async (query: string): Promise<BackendProject[]> => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return mockProjects.filter(
            (project) => project.name.toLowerCase().includes(query.toLowerCase()) || project.description.toLowerCase().includes(query.toLowerCase()),
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Multiple Selector Test" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="p-6 text-gray-900">
                            <div className="space-y-8">
                                <div>
                                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Multiple Selector with Backend Data</h1>
                                    <p className="mb-8 text-gray-600">
                                        Testing custom option rendering and badge customization with transformer functions for backend data
                                        integration.
                                    </p>
                                </div>

                                {/* User Selection */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-800">👥 User Selection (Custom Avatar & Status)</h3>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Search and select users with custom avatar, status indicators, and detailed information display.
                                        </p>
                                    </div>
                                    <MultipleSelector
                                        placeholder="Search users by name, email, role, or department..."
                                        onSearch={async (query) => {
                                            const users = await searchUsers(query);
                                            return users as any[];
                                        }}
                                        optionTransformer={userTransformer}
                                        selectedTransformer={userTransformer}
                                        value={selectedUsers}
                                        onChange={setSelectedUsers}
                                        className="w-full"
                                        delay={300}
                                        maxSelected={5}
                                        onMaxSelected={(limit) => alert(`Maximum ${limit} users can be selected`)}
                                    />
                                    {selectedUsers.length > 0 && (
                                        <div className="mt-3 rounded-lg bg-blue-50 p-3">
                                            <p className="text-sm font-medium text-blue-800">Selected Users ({selectedUsers.length}):</p>
                                            <div className="mt-1 text-xs text-blue-600">{selectedUsers.map((user) => user.label).join(', ')}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Department Selection */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-800">🏢 Department Selection (Rich Information)</h3>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Select departments with detailed information including manager, location, employee count, and budget.
                                        </p>
                                    </div>
                                    <MultipleSelector
                                        placeholder="Search departments..."
                                        onSearch={async (query) => {
                                            const departments = await searchDepartments(query);
                                            return departments as any[];
                                        }}
                                        optionTransformer={departmentTransformer}
                                        selectedTransformer={departmentTransformer}
                                        value={selectedDepartments}
                                        onChange={setSelectedDepartments}
                                        className="w-full"
                                        delay={500}
                                        triggerSearchOnFocus={true}
                                    />
                                    {selectedDepartments.length > 0 && (
                                        <div className="mt-3 rounded-lg bg-green-50 p-3">
                                            <p className="text-sm font-medium text-green-800">Selected Departments ({selectedDepartments.length}):</p>
                                            <div className="mt-1 text-xs text-green-600">
                                                {selectedDepartments.map((dept) => dept.label).join(', ')}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Project Selection */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-800">📋 Project Selection (Progress & Priority)</h3>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Select projects with status badges, priority indicators, progress bars, and team information.
                                        </p>
                                    </div>
                                    <MultipleSelector
                                        placeholder="Search projects..."
                                        onSearch={async (query) => {
                                            const projects = await searchProjects(query);
                                            return projects as any[];
                                        }}
                                        optionTransformer={projectTransformer}
                                        selectedTransformer={projectTransformer}
                                        value={selectedProjects}
                                        onChange={setSelectedProjects}
                                        className="w-full"
                                        delay={400}
                                        single={false}
                                    />
                                    {selectedProjects.length > 0 && (
                                        <div className="mt-3 rounded-lg bg-purple-50 p-3">
                                            <p className="text-sm font-medium text-purple-800">Selected Projects ({selectedProjects.length}):</p>
                                            <div className="mt-1 text-xs text-purple-600">
                                                {selectedProjects.map((project) => project.label).join(', ')}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Static Options Example */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-800">⚡ Static Options (Pre-loaded)</h3>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Pre-loaded options with transformer functions applied to static data.
                                        </p>
                                    </div>
                                    <MultipleSelector
                                        placeholder="Select from predefined users..."
                                        defaultOptions={mockUsers.slice(0, 4) as any[]}
                                        optionTransformer={userTransformer}
                                        selectedTransformer={userTransformer}
                                        className="w-full"
                                        creatable={true}
                                        maxSelected={3}
                                    />
                                </div>

                                {/* Single Selection Mode */}
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="mb-2 text-lg font-semibold text-gray-800">🎯 Single Selection Mode</h3>
                                        <p className="mb-3 text-sm text-gray-600">
                                            Single selection mode with custom rendering - only one option can be selected.
                                        </p>
                                    </div>
                                    <MultipleSelector
                                        placeholder="Select one department..."
                                        defaultOptions={mockDepartments as any[]}
                                        optionTransformer={departmentTransformer}
                                        selectedTransformer={departmentTransformer}
                                        className="w-full"
                                        single={true}
                                    />
                                </div>

                                {/* Feature Summary */}
                                <div className="mt-12 rounded-lg bg-gray-50 p-6">
                                    <h3 className="mb-4 text-lg font-semibold text-gray-800">✨ Features Demonstrated</h3>
                                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-700">Custom Option Rendering:</h4>
                                            <ul className="ml-4 space-y-1 text-gray-600">
                                                <li>• Avatar with initials and status indicators</li>
                                                <li>• Rich information display (email, role, location)</li>
                                                <li>• Progress bars and priority indicators</li>
                                                <li>• Custom icons and color coding</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-700">Custom Badge Rendering:</h4>
                                            <ul className="ml-4 space-y-1 text-gray-600">
                                                <li>• Gradient backgrounds and custom styling</li>
                                                <li>• Avatar integration in badges</li>
                                                <li>• Status indicators and progress display</li>
                                                <li>• Interactive remove buttons</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-700">Backend Integration:</h4>
                                            <ul className="ml-4 space-y-1 text-gray-600">
                                                <li>• Async search with debouncing</li>
                                                <li>• Automatic data transformation</li>
                                                <li>• Raw backend data support</li>
                                                <li>• Caching and performance optimization</li>
                                            </ul>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium text-gray-700">Advanced Features:</h4>
                                            <ul className="ml-4 space-y-1 text-gray-600">
                                                <li>• Single and multiple selection modes</li>
                                                <li>• Maximum selection limits</li>
                                                <li>• Creatable options</li>
                                                <li>• Trigger search on focus</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
