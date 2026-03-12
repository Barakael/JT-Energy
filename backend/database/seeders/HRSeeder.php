<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class HRSeeder extends Seeder
{
    public function run(): void
    {
        // ── Roles ────────────────────────────────────────────────────────────
        $hrAdminRole  = Role::firstOrCreate(['name' => 'hr_admin',  'guard_name' => 'sanctum']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee',  'guard_name' => 'sanctum']);

        // ── Departments ───────────────────────────────────────────────────────
        $departments = collect([
            ['name' => 'Engineering',      'code' => 'ENG'],
            ['name' => 'Human Resources',  'code' => 'HR'],
            ['name' => 'Marketing',        'code' => 'MKT'],
            ['name' => 'Finance',          'code' => 'FIN'],
            ['name' => 'Operations',       'code' => 'OPS'],
            ['name' => 'Product',          'code' => 'PRD'],
        ])->mapWithKeys(fn ($dept) => [
            $dept['name'] => Department::firstOrCreate(
                ['name' => $dept['name']],
                [
                    'code'        => $dept['code'],
                    'description' => "{$dept['name']} department",
                    'active'      => true,
                ]
            ),
        ]);

        // ── HR Admin ──────────────────────────────────────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@hrportal.com'],
            [
                'name'     => 'Barakael Lucas',
                'password' => Hash::make('password'),
            ]
        );
        $admin->syncRoles([$hrAdminRole]);

        EmployeeProfile::firstOrCreate(
            ['user_id' => $admin->id],
            [
                'department_id' => $departments['Human Resources']->id,
                'title'         => 'HR Director',
                'phone'         => '+1 (555) 100-0001',
                'location'      => 'New York, NY',
                'status'        => 'Active',
                'joined_at'     => '2021-01-15',
            ]
        );

        // Update HR dept head
        $departments['Human Resources']->update(['head_user_id' => $admin->id]);

        // ── Employees ─────────────────────────────────────────────────────────
        $employees = [
            [
                'name'     => 'Charles Benedict',
                'email'    => 'charles.benedict@hrportal.com',
                'title'    => 'Senior Engineer',
                'dept'     => 'Engineering',
                'phone'    => '+1 (555) 100-0002',
                'location' => 'San Francisco, CA',
                'joined'   => '2022-03-01',
            ],
            [
                'name'     => 'James Brown',
                'email'    => 'james.brown@hrportal.com',
                'title'    => 'Marketing Lead',
                'dept'     => 'Marketing',
                'phone'    => '+1 (555) 100-0003',
                'location' => 'Chicago, IL',
                'joined'   => '2021-06-15',
            ],
            [
                'name'     => 'Emily Davis',
                'email'    => 'emily.davis@hrportal.com',
                'title'    => 'Product Designer',
                'dept'     => 'Product',
                'phone'    => '+1 (555) 100-0004',
                'location' => 'Austin, TX',
                'joined'   => '2023-01-10',
            ],
            [
                'name'     => 'Michael Chen',
                'email'    => 'michael.chen@hrportal.com',
                'title'    => 'Junior Developer',
                'dept'     => 'Engineering',
                'phone'    => '+1 (555) 100-0005',
                'location' => 'Seattle, WA',
                'joined'   => '2024-02-01',
            ],
            [
                'name'     => 'Jessica Lee',
                'email'    => 'jessica.lee@hrportal.com',
                'title'    => 'HR Coordinator',
                'dept'     => 'Human Resources',
                'phone'    => '+1 (555) 100-0006',
                'location' => 'New York, NY',
                'joined'   => '2022-09-05',
            ],
            [
                'name'     => 'David Kim',
                'email'    => 'david.kim@hrportal.com',
                'title'    => 'Financial Analyst',
                'dept'     => 'Finance',
                'phone'    => '+1 (555) 100-0007',
                'location' => 'Boston, MA',
                'joined'   => '2021-11-20',
            ],
            [
                'name'     => 'Robert Wilson',
                'email'    => 'robert.wilson@hrportal.com',
                'title'    => 'Operations Manager',
                'dept'     => 'Operations',
                'phone'    => '+1 (555) 100-0008',
                'location' => 'Dallas, TX',
                'joined'   => '2020-07-01',
            ],
            [
                'name'     => 'Amanda Torres',
                'email'    => 'amanda.torres@hrportal.com',
                'title'    => 'Product Manager',
                'dept'     => 'Product',
                'phone'    => '+1 (555) 100-0009',
                'location' => 'Los Angeles, CA',
                'joined'   => '2022-04-18',
            ],
        ];

        foreach ($employees as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name'     => $data['name'],
                    'password' => Hash::make('password'),
                ]
            );
            $user->syncRoles([$employeeRole]);

            EmployeeProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'department_id' => $departments[$data['dept']]->id,
                    'manager_id'    => $admin->id,
                    'title'         => $data['title'],
                    'phone'         => $data['phone'],
                    'location'      => $data['location'],
                    'status'        => 'Active',
                    'joined_at'     => $data['joined'],
                ]
            );
        }

        $this->command->info('✓ Roles, departments, HR admin, and 8 employees seeded.');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['hr_admin', 'admin@hrportal.com', 'password'],
                ['employee', 'sarah.miller@hrportal.com', 'password'],
                ['employee', 'james.brown@hrportal.com', 'password'],
                ['employee', '... (6 more employees)', 'password'],
            ]
        );
    }
}
