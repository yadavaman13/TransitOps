import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { db, pool } from '../config/database.js';
import { users } from './schema/users.schema.js';
import { driverProfiles } from './schema/driver-profiles.schema.js';
import { vehicles } from './schema/vehicles.schema.js';
import { trips } from './schema/trips.schema.js';
import { fuelLogs } from './schema/fuel-logs.schema.js';
import { maintenance } from './schema/maintenance.schema.js';
import { expenses } from './schema/expenses.schema.js';
import { notifications } from './schema/notifications.schema.js';
import { vehicleDocuments } from './schema/vehicle-documents.schema.js';
import { settings } from './schema/settings.schema.js';

async function seedRealisticData() {
    console.log('Seeding realistic database records...');
    const hashedPassword = await bcrypt.hash('TransitOpsSecure2026', 10);

    try {
        // 1. Seed Users (RBAC)
        const userRecords = await db.insert(users).values([
            {
                name: 'James Bennett',
                email: 'james.bennett@transitops.com',
                password: hashedPassword,
                role: 'FLEET_MANAGER',
                emailVerified: true,
                isActive: true,
                isDeleted: false,
                phone: '9812345670',
                status: 'ACTIVE'
            },
            {
                name: 'Sarah Connor',
                email: 'sarah.connor@transitops.com',
                password: hashedPassword,
                role: 'SAFETY_OFFICER',
                emailVerified: true,
                isActive: true,
                isDeleted: false,
                phone: '9812345671',
                status: 'ACTIVE'
            },
            {
                name: 'David Kowalski',
                email: 'david.kowalski@transitops.com',
                password: hashedPassword,
                role: 'FINANCIAL_ANALYST',
                emailVerified: true,
                isActive: true,
                isDeleted: false,
                phone: '9812345672',
                status: 'ACTIVE'
            },
            {
                name: 'Robert Miller',
                email: 'robert.miller@transitops.com',
                password: hashedPassword,
                role: 'DRIVER',
                emailVerified: true,
                isActive: true,
                isDeleted: false,
                phone: '9876543210',
                status: 'ACTIVE'
            },
            {
                name: 'John Doe',
                email: 'john.doe@transitops.com',
                password: hashedPassword,
                role: 'DRIVER',
                emailVerified: true,
                isActive: true,
                isDeleted: false,
                phone: '9812345678',
                status: 'ACTIVE'
            },
            {
                name: 'Carlos Santoro',
                email: 'carlos.santoro@transitops.com',
                password: hashedPassword,
                role: 'DRIVER',
                emailVerified: true,
                isActive: true,
                isDeleted: false,
                phone: '9945612378',
                status: 'ACTIVE'
            },
            {
                name: 'Alex Wong',
                email: 'alex.wong@transitops.com',
                password: hashedPassword,
                role: 'DRIVER',
                emailVerified: true,
                isActive: true,
                isDeleted: false,
                phone: '9789456123',
                status: 'ACTIVE'
            }
        ]).returning();

        const manager = userRecords.find(u => u.role === 'FLEET_MANAGER');
        const driverRobert = userRecords.find(u => u.email === 'robert.miller@transitops.com');
        const driverJohn = userRecords.find(u => u.email === 'john.doe@transitops.com');
        const driverCarlos = userRecords.find(u => u.email === 'carlos.santoro@transitops.com');
        const driverAlex = userRecords.find(u => u.email === 'alex.wong@transitops.com');

        console.log('✔ Seeded users');

        // 2. Seed Driver Profiles
        await db.insert(driverProfiles).values([
            {
                userId: driverRobert.id,
                licenseNumber: 'DL-45910A',
                licenseExpiry: new Date('2028-10-15'),
                joiningDate: new Date('2022-04-01'),
                phone: '9876543210',
                emergencyContact: 'Mary Miller (Wife) - 9876543211',
                bloodGroup: 'O+',
                safetyScore: '98.50',
                experienceYears: 8,
                availabilityStatus: 'AVAILABLE'
            },
            {
                userId: driverJohn.id,
                licenseNumber: 'DL-12845B',
                licenseExpiry: new Date('2027-05-20'),
                joiningDate: new Date('2023-08-15'),
                phone: '9812345678',
                emergencyContact: 'Jane Doe (Mother) - 9812345679',
                bloodGroup: 'A+',
                safetyScore: '94.00',
                experienceYears: 5,
                availabilityStatus: 'ON_TRIP'
            },
            {
                userId: driverCarlos.id,
                licenseNumber: 'DL-90812C',
                licenseExpiry: new Date('2030-01-10'),
                joiningDate: new Date('2018-02-10'),
                phone: '9945612378',
                emergencyContact: 'Isabella Santoro (Sister) - 9945612379',
                bloodGroup: 'B+',
                safetyScore: '99.10',
                experienceYears: 12,
                availabilityStatus: 'AVAILABLE'
            },
            {
                userId: driverAlex.id,
                licenseNumber: 'DL-67123D',
                licenseExpiry: new Date('2026-08-05'), // Expiring soon
                joiningDate: new Date('2024-01-05'),
                phone: '9789456123',
                emergencyContact: 'Wong Ah (Father) - 9789456124',
                bloodGroup: 'O-',
                safetyScore: '88.00',
                experienceYears: 3,
                availabilityStatus: 'AVAILABLE'
            }
        ]);
        console.log('✔ Seeded driver profiles');

        // 3. Seed Vehicles
        const vehicleRecords = await db.insert(vehicles).values([
            {
                registrationNumber: 'MH-12-PQ-9081',
                vehicleNumber: 'VOLVO-FH16-01',
                brand: 'Volvo',
                model: 'FH16 Heavy Cargo',
                manufactureYear: 2021,
                capacityKg: '25000.00',
                fuelType: 'Diesel',
                currentOdometer: '126420.00',
                status: 'AVAILABLE',
                purchaseDate: new Date('2021-06-15'),
                insuranceExpiry: new Date('2027-06-15'),
                pollutionExpiry: new Date('2026-12-15')
            },
            {
                registrationNumber: 'DL-01-AB-1234',
                vehicleNumber: 'SCANIA-R450-02',
                brand: 'Scania',
                model: 'R450 Hauler',
                manufactureYear: 2022,
                capacityKg: '18000.00',
                fuelType: 'Diesel',
                currentOdometer: '98000.00',
                status: 'ON_TRIP',
                purchaseDate: new Date('2022-09-10'),
                insuranceExpiry: new Date('2027-09-10'),
                pollutionExpiry: new Date('2026-11-10')
            },
            {
                registrationNumber: 'KA-03-XY-5678',
                vehicleNumber: 'TATA-PRIMA-03',
                brand: 'Tata',
                model: 'Prima 3525.K Tipper',
                manufactureYear: 2020,
                capacityKg: '15000.00',
                fuelType: 'Diesel',
                currentOdometer: '45000.00',
                status: 'MAINTENANCE',
                purchaseDate: new Date('2020-03-10'),
                insuranceExpiry: new Date('2026-03-10'),
                pollutionExpiry: new Date('2026-09-10')
            },
            {
                registrationNumber: 'GJ-05-MN-2468',
                vehicleNumber: 'EICHER-PRO-04',
                brand: 'Eicher',
                model: 'Pro 3019 Logistics',
                manufactureYear: 2023,
                capacityKg: '9500.00',
                fuelType: 'Diesel',
                currentOdometer: '32000.00',
                status: 'AVAILABLE',
                purchaseDate: new Date('2023-01-20'),
                insuranceExpiry: new Date('2026-01-20'),
                pollutionExpiry: new Date('2026-07-20')
            }
        ]).returning();

        const volvo = vehicleRecords.find(v => v.vehicleNumber === 'VOLVO-FH16-01');
        const scania = vehicleRecords.find(v => v.vehicleNumber === 'SCANIA-R450-02');
        const tata = vehicleRecords.find(v => v.vehicleNumber === 'TATA-PRIMA-03');

        console.log('✔ Seeded vehicles');

        // 4. Seed Trips
        const tripRecords = await db.insert(trips).values([
            {
                tripNumber: 'TRP-1011',
                vehicleId: volvo.id,
                driverId: driverRobert.id,
                createdBy: manager.id,
                source: 'Mumbai Port Yard',
                destination: 'Delhi Logistics Terminal',
                cargoName: 'Precision Machinery Parts',
                cargoWeight: '12400.00',
                distanceKm: '1420.00',
                plannedStart: new Date('2026-07-01T08:00:00Z'),
                plannedEnd: new Date('2026-07-04T18:00:00Z'),
                actualStart: new Date('2026-07-01T08:15:00Z'),
                actualEnd: new Date('2026-07-04T17:30:00Z'),
                status: 'COMPLETED',
                remarks: 'Smooth journey, cargo delivered without damage.'
            },
            {
                tripNumber: 'TRP-1012',
                vehicleId: scania.id,
                driverId: driverJohn.id,
                createdBy: manager.id,
                source: 'Delhi ICD Ghevra',
                destination: 'Jaipur Industrial Area',
                cargoName: 'Raw Cotton Bales',
                cargoWeight: '15000.00',
                distanceKm: '280.00',
                plannedStart: new Date('2026-07-11T06:00:00Z'),
                plannedEnd: new Date('2026-07-12T14:00:00Z'),
                actualStart: new Date('2026-07-11T06:30:00Z'),
                status: 'DISPATCHED',
                remarks: 'Currently in transit on NH48.'
            },
            {
                tripNumber: 'TRP-1013',
                vehicleId: tata.id,
                driverId: driverCarlos.id,
                createdBy: manager.id,
                source: 'Bangalore Quarry A',
                destination: 'Chennai Metro Construction Site',
                cargoName: 'Granite Aggregates',
                cargoWeight: '14200.00',
                distanceKm: '350.00',
                plannedStart: new Date('2026-07-15T04:00:00Z'),
                plannedEnd: new Date('2026-07-15T16:00:00Z'),
                status: 'DRAFT'
            }
        ]).returning();

        const trip1 = tripRecords.find(t => t.tripNumber === 'TRP-1011');
        const trip2 = tripRecords.find(t => t.tripNumber === 'TRP-1012');

        console.log('✔ Seeded trips');

        // 5. Seed Fuel Logs
        await db.insert(fuelLogs).values([
            {
                tripId: trip1.id,
                vehicleId: volvo.id,
                driverId: driverRobert.id,
                litres: '480.00',
                pricePerLitre: '98.50',
                totalCost: '47280.00',
                stationName: 'HP Highway Oasis, Ahmedabad',
                odometer: '125480.00'
            },
            {
                tripId: trip2.id,
                vehicleId: scania.id,
                driverId: driverJohn.id,
                litres: '110.00',
                pricePerLitre: '97.20',
                totalCost: '10692.00',
                stationName: 'Indian Oil Plaza, Kotputli',
                odometer: '98150.00'
            }
        ]);
        console.log('✔ Seeded fuel logs');

        // 6. Seed Maintenance
        await db.insert(maintenance).values([
            {
                vehicleId: scania.id,
                title: '50K Service and Brake Pad Replacement',
                description: 'Replaced front brake pads, engine oil flush, and oil filters.',
                maintenanceType: 'General Service',
                cost: '14500.00',
                serviceCenter: 'Scania Authorized Workshop, Okhla',
                scheduledDate: new Date('2026-06-10'),
                completedDate: new Date('2026-06-11'),
                status: 'COMPLETED'
            },
            {
                vehicleId: tata.id,
                title: 'Suspension Check and Hydraulic Cylinder Maintenance',
                description: 'Tipper hydraulic pump leaking fluid. Seal kit replacement.',
                maintenanceType: 'Repair',
                cost: '24000.00',
                serviceCenter: 'Tata Motors Commercial Hub, Bangalore',
                scheduledDate: new Date('2026-07-12'),
                status: 'PENDING'
            }
        ]);
        console.log('✔ Seeded maintenance records');

        // 7. Seed Expenses
        await db.insert(expenses).values([
            {
                tripId: trip1.id,
                vehicleId: volvo.id,
                category: 'Toll',
                amount: '3850.00',
                description: 'NH8 Mumbai-Delhi Fastag transactions.',
                createdBy: driverRobert.id
            },
            {
                tripId: trip2.id,
                vehicleId: scania.id,
                category: 'Parking',
                amount: '500.00',
                description: 'Warehouse overnight halting charges.',
                createdBy: driverJohn.id
            }
        ]);
        console.log('✔ Seeded expenses');

        // 8. Seed Notifications
        await db.insert(notifications).values([
            {
                userId: driverRobert.id,
                title: 'Trip Completed Successfully',
                message: 'Your trip TRP-1011 has been successfully recorded as completed.',
                isRead: true
            },
            {
                userId: driverAlex.id,
                title: 'License Renewal Due',
                message: 'Your Commercial Driver License expires in less than 30 days. Please submit a renewal form.',
                isRead: false
            }
        ]);
        console.log('✔ Seeded notifications');

        // 9. Seed Vehicle Documents
        await db.insert(vehicleDocuments).values([
            {
                vehicleId: volvo.id,
                documentType: 'RC',
                fileName: 'Volvo_FH16_RC_2021.pdf',
                filePath: '/documents/fleet/volvo_fh16_rc.pdf',
                fileSize: 1048576,
                expiryDate: new Date('2036-06-15'),
                uploadedBy: manager.id
            },
            {
                vehicleId: volvo.id,
                documentType: 'Insurance',
                fileName: 'Volvo_FH16_Insurance_Expiry_2027.pdf',
                filePath: '/documents/fleet/volvo_insurance.pdf',
                fileSize: 2097152,
                expiryDate: new Date('2027-06-15'),
                uploadedBy: manager.id
            }
        ]);
        console.log('✔ Seeded vehicle documents');

        // 10. Seed Settings
        for (const user of userRecords) {
            await db.insert(settings).values({
                userId: user.id,
                theme: user.role === 'FLEET_MANAGER' ? 'dark' : 'light'
            });
        }
        console.log('✔ Seeded user settings');

        console.log('🏆 Realistic Seeding Completed Successfully!');
    } catch (e) {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    }
}

seedRealisticData().then(() => {
    pool.end().then(() => process.exit(0));
});
