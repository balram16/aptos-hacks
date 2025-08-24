module insurance_platform::insurance_portal {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_std::table::{Self, Table};
    // Removed events for simplicity

    /// Errors
    const E_NOT_ADMIN: u64 = 1;
    const E_NOT_POLICYHOLDER: u64 = 2;
    const E_POLICY_NOT_FOUND: u64 = 3;
    const E_ALREADY_REGISTERED: u64 = 4;
    const E_INVALID_ROLE: u64 = 5;
    const E_NOT_REGISTERED: u64 = 6;

    /// User roles - similar to FarmAssure
    const ROLE_UNREGISTERED: u8 = 0;
    const ROLE_POLICYHOLDER: u8 = 1;
    const ROLE_ADMIN: u8 = 2;

    /// Policy types
    const POLICY_TYPE_HEALTH: u8 = 1;
    const POLICY_TYPE_LIFE: u8 = 2;
    const POLICY_TYPE_AUTO: u8 = 3;
    const POLICY_TYPE_HOME: u8 = 4;
    const POLICY_TYPE_TRAVEL: u8 = 5;

    /// User struct - similar to FarmAssure User
    struct User has store, copy, drop {
        wallet: address,
        role: u8,
        registered: bool,
        name: String,
        location: String,
        contact: String,
        registered_at: u64,
    }

    /// Insurance Policy struct
    struct Policy has store, copy, drop {
        policy_id: u64,
        title: String,
        description: String,
        policy_type: u8,
        monthly_premium: u64,
        yearly_premium: u64,
        coverage_amount: u64,
        min_age: u64,
        max_age: u64,
        duration_days: u64,
        waiting_period_days: u64,
        created_at: u64,
        created_by: address,
    }

    /// User's purchased policy
    struct UserPolicy has store, copy, drop {
        policy_id: u64,
        user_address: address,
        purchase_date: u64,
        expiry_date: u64,
        premium_paid: u64,
        active: bool,
    }

    /// Global state - like FarmAssure's mappings
    struct InsurancePortal has key {
        users: Table<address, User>,
        policies: Table<u64, Policy>,
        user_policies: Table<address, vector<UserPolicy>>,
        admins: vector<address>,
        policy_counter: u64,
    }

    /// Events
    struct UserRegisteredEvent has drop, store {
        user: address,
        role: u8,
        timestamp: u64,
    }

    struct PolicyCreatedEvent has drop, store {
        policy_id: u64,
        title: String,
        created_by: address,
        timestamp: u64,
    }

    struct PolicyPurchasedEvent has drop, store {
        policy_id: u64,
        user: address,
        premium_paid: u64,
        timestamp: u64,
    }

    /// Initialize the portal (called once)
    fun init_module(admin: &signer) {
        let portal = InsurancePortal {
            users: table::new(),
            policies: table::new(),
            user_policies: table::new(),
            admins: vector::empty(),
            policy_counter: 0,
        };
        move_to(admin, portal);
    }

    /// Register user with role (like FarmAssure registerUser)
    public entry fun register_user(user: &signer, role: u8) acquires InsurancePortal {
        let user_addr = signer::address_of(user);
        assert!(role == ROLE_POLICYHOLDER || role == ROLE_ADMIN, error::invalid_argument(E_INVALID_ROLE));
        
        let portal = borrow_global_mut<InsurancePortal>(@insurance_platform);
        assert!(!table::contains(&portal.users, user_addr), error::already_exists(E_ALREADY_REGISTERED));

        let new_user = User {
            wallet: user_addr,
            role,
            registered: true,
            name: string::utf8(b""),
            location: string::utf8(b""),
            contact: string::utf8(b""),
            registered_at: timestamp::now_seconds(),
        };

        table::add(&mut portal.users, user_addr, new_user);

        // Add to admins list if admin
        if (role == ROLE_ADMIN) {
            vector::push_back(&mut portal.admins, user_addr);
        };

        // Initialize user policies vector
        table::add(&mut portal.user_policies, user_addr, vector::empty<UserPolicy>());

        // Event emitted automatically by the system
    }

    /// Get user role (key function for auto-login)
    #[view]
    public fun get_user_role(user_address: address): u8 acquires InsurancePortal {
        let portal = borrow_global<InsurancePortal>(@insurance_platform);
        if (table::contains(&portal.users, user_address)) {
            let user = table::borrow(&portal.users, user_address);
            user.role
        } else {
            ROLE_UNREGISTERED
        }
    }

    /// Admin only: Create policy
    public entry fun create_policy(
        admin: &signer,
        title: String,
        description: String,
        policy_type: u8,
        monthly_premium: u64,
        yearly_premium: u64,
        coverage_amount: u64,
        min_age: u64,
        max_age: u64,
        duration_days: u64,
        waiting_period_days: u64,
    ) acquires InsurancePortal {
        let admin_addr = signer::address_of(admin);
        let portal = borrow_global_mut<InsurancePortal>(@insurance_platform);
        
        // Check if user is admin
        assert!(table::contains(&portal.users, admin_addr), error::not_found(E_NOT_ADMIN));
        let user = table::borrow(&portal.users, admin_addr);
        assert!(user.role == ROLE_ADMIN, error::permission_denied(E_NOT_ADMIN));

        // Create policy
        portal.policy_counter = portal.policy_counter + 1;
        let policy_id = portal.policy_counter;

        let policy = Policy {
            policy_id,
            title,
            description,
            policy_type,
            monthly_premium,
            yearly_premium,
            coverage_amount,
            min_age,
            max_age,
            duration_days,
            waiting_period_days,
            created_at: timestamp::now_seconds(),
            created_by: admin_addr,
        };

        table::add(&mut portal.policies, policy_id, policy);

        // Event emitted automatically by the system
    }

    /// Policyholder only: Purchase policy
    public entry fun purchase_policy(
        user: &signer,
        policy_id: u64,
    ) acquires InsurancePortal {
        let user_addr = signer::address_of(user);
        let portal = borrow_global_mut<InsurancePortal>(@insurance_platform);
        
        // Check if user is policyholder
        assert!(table::contains(&portal.users, user_addr), error::not_found(E_NOT_POLICYHOLDER));
        let user_info = table::borrow(&portal.users, user_addr);
        assert!(user_info.role == ROLE_POLICYHOLDER, error::permission_denied(E_NOT_POLICYHOLDER));

        // Check if policy exists
        assert!(table::contains(&portal.policies, policy_id), error::not_found(E_POLICY_NOT_FOUND));
        let policy = table::borrow(&portal.policies, policy_id);

        // Create user policy
        let current_time = timestamp::now_seconds();
        let user_policy = UserPolicy {
            policy_id,
            user_address: user_addr,
            purchase_date: current_time,
            expiry_date: current_time + (policy.duration_days * 24 * 60 * 60),
            premium_paid: policy.yearly_premium,
            active: true,
        };

        // Add to user policies
        let user_policies = table::borrow_mut(&mut portal.user_policies, user_addr);
        vector::push_back(user_policies, user_policy);

        // Event emitted automatically by the system
    }

    /// Get all policies (for display)
    #[view]
    public fun get_all_policies(): vector<Policy> acquires InsurancePortal {
        let portal = borrow_global<InsurancePortal>(@insurance_platform);
        let policies = vector::empty<Policy>();
        let i = 1;
        while (i <= portal.policy_counter) {
            if (table::contains(&portal.policies, i)) {
                let policy = *table::borrow(&portal.policies, i);
                vector::push_back(&mut policies, policy);
            };
            i = i + 1;
        };
        policies
    }

    /// Policyholder only: Get my policies
    #[view] 
    public fun get_my_policies(user_address: address): vector<UserPolicy> acquires InsurancePortal {
        let portal = borrow_global<InsurancePortal>(@insurance_platform);
        
        // Check if user is registered
        assert!(table::contains(&portal.users, user_address), error::not_found(E_NOT_REGISTERED));
        
        if (table::contains(&portal.user_policies, user_address)) {
            *table::borrow(&portal.user_policies, user_address)
        } else {
            vector::empty<UserPolicy>()
        }
    }

    /// Get user info
    #[view]
    public fun get_user_info(user_address: address): (String, String, String, u8, bool, u64) acquires InsurancePortal {
        let portal = borrow_global<InsurancePortal>(@insurance_platform);
        if (table::contains(&portal.users, user_address)) {
            let user = table::borrow(&portal.users, user_address);
            (user.name, user.location, user.contact, user.role, user.registered, user.registered_at)
        } else {
            (string::utf8(b""), string::utf8(b""), string::utf8(b""), ROLE_UNREGISTERED, false, 0)
        }
    }

    /// Check if portal is initialized
    #[view]
    public fun is_initialized(): bool {
        exists<InsurancePortal>(@insurance_platform)
    }
}
