
import {Collapse, Item, Items, Navbar as BaseNavbar} from "ultimate-react-multilevel-menu";
import 'ultimate-react-multilevel-menu/dist/esm/index.css'

import {NavLink, useLocation, useNavigate} from "react-router-dom";
import {auth} from "../../firebase";
import {hasRole} from "../../utils/CommonHelper";

const Navbar = () => {
    // const [openDropdownIndex, setOpenDropdownIndex] = useState(null);


    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const handleLogout = async () => {
        await auth.signOut();
        localStorage.clear();
        return navigate('/auth/login');
    };

    const navItems = [
        { title: 'Work Order', path: '/' },
        { title: 'Database', path: '/database' },
        {
            title: 'Management',
            children: [
                { title: 'Birch User Management', path: '/user_management' },
                { title: 'Team Member Management', path: '/team_member_management' },
                ...(hasRole('ADMIN') ? [{ title: 'Routing Matrix', path: '/routing_matrix' }] : []), // Only for ADMIN
            ]
        },
        {
            title: 'Time Tracking',
            children: [
                { title: 'Time Approval', path: '/time_approval' },
                ...(hasRole('TECH') ? [{ title: 'WORK STATION', path: '/work_station' }] : []),
            ]
        },
        {
            title: 'Report',
            children: [
                { title: 'Summary Report', path: '/summary_report' },
                { title: 'Department Report', path: '/department_report' },
                {
                    title: 'Management Reports',
                    children: [
                        { title: 'Revenue by Customer', path: '/rev_by_customer' },
                        { title: 'Revenue by Department', path: '/rev_by_department' },
                        { title: 'Revenue Recognition', path: 'revenue_recognition' },
                        { title: 'Rev. Recog. By DEPT', path: '/revenue_recognition_by_department' },
                        { title: 'Rev. Recog. By Inventory', path: '/revenue_recognition_by_inventory' },
                        { title: 'Billed Cars', path: '#' }
                    ]
                },
                {
                    title: 'Operations Reports',
                    children: [
                        { title: 'Shop Summary Report', path: '#' },
                        { title: 'Indirect Hours Report', path: '/indirect_hour_report' },
                        { title: 'Manhours', path: '#' },
                        { title: 'Billing Efficiency', path: '/billing_efficiency' },
                        { title: 'Utilization', path: '/utilization_report' },
                        { title: 'POD Accuracy', path: '#' },
                        { title: 'Days in Status', path: '#' }
                    ]
                },
                {
                    title: 'Purchasing',
                    children: [
                        { title: 'Revenue By Inventory', path: '#' },
                        { title: 'Allocated Inventory', path: '#' }
                    ]
                },
                {
                    title: 'Inventory',
                    children: [
                        { title: 'QB Parts', path: '/qb_parts' },
                        { title: 'Stock Status Report', path: '/stock_status_report' }
                    ]
                },
                {
                    title: 'Misc. Reports',
                    children: [
                        { title: 'User Activity', path: '#' },
                        { title: 'Emission Report', path: '/emission_report' },
                        { title: 'Part Report', path: '/part_report' },
                        { title: 'Department Time Report', path: '/department_time_report' },
                        { title: 'QB Time Compare', path: '/qb_time_compare' },
                        { title: 'Storage Report', path: '/storage_report' }
                    ]
                }
            ]
        }
    ].filter(item => {
        if (item.title === 'Management') {
            // Hide Management if user does not have ADMIN or HR role
            return hasRole('ADMIN') || hasRole('HR');
        }
        if (item.title === 'Time Tracking') {
            // Hide Time Tracking if user does not have ADMIN, MANAGEMENT, or TIME APPROVAL role
            return hasRole('ADMIN') || hasRole('MANAGEMENT') || hasRole('TIME APPROVAL');
        }
        return true; // Include all other items
    });

// Conditionally append Management for ADMIN or HR roles
    if (hasRole('ADMIN') || hasRole('HR')) {
        // Remove the Management item if it exists and re-add it
        const managementItem = navItems.find(item => item.title === 'Management');
        if (managementItem) {
            managementItem.children = [
                { title: 'Birch User Management', path: '/user_management' },
                { title: 'Team Member Management', path: '/team_member_management' },
                ...(hasRole('ADMIN') ? [{ title: 'Routing Matrix', path: '/routing_matrix' }] : []), // Only for ADMIN
            ];
        } else {
            navItems.push({
                title: 'Management',
                children: [
                    { title: 'Birch User Management', path: '/user_management' },
                    { title: 'Team Member Management', path: '/team_member_management' },
                    ...(hasRole('ADMIN') ? [{ title: 'Routing Matrix', path: '/routing_matrix' }] : []), // Only for ADMIN
                ]
            });
        }
    }


    const isItemSelected = (item, selectedPath) => {
        if (item.path === selectedPath) return true;
        if (item.children) {
            return item.children.some(child => isItemSelected(child, selectedPath));
        }
        return false;
    };

    const renderNavItems = (items, selectedPath) => {
        return items.map((navItem) => {
            const isSelected = isItemSelected(navItem, selectedPath);
            const itemClassName = isSelected ? "menu-item menu-item-selected" : "menu-item";

            if (navItem.children) {
                return (
                    <Items
                        key={navItem.title}
                        href={navItem.path || '#'}
                        title={navItem.title}
                        className={itemClassName} // Apply class to Items container
                    >
                        {renderNavItems(navItem.children, selectedPath)}
                    </Items>
                );
            } else {
                return (
                    <Item
                        key={navItem.title}
                        href={navItem.path}
                        className={itemClassName} // Apply class to Item
                    >
                        {navItem.title}
                    </Item>
                );
            }
        });
    };

    return (
        <div className={`w-full p-0 mx-auto`}>
            <div className="hidden lg:flex md:flex justify-between bg-[#002E54] text-white w-full items-center px-[20px]">
                <BaseNavbar style={{ backgroundColor: '#002E54' }}>
                    <Collapse>
                        {renderNavItems(navItems, currentPath)}
                    </Collapse>
                </BaseNavbar>
                <div className="h-fit flex items-center my-2">
                    <div className="ml-[24px] tooltip tooltip-bottom" data-tip="Log Out">
                        <svg className="ml-[24px] cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg" onClick={handleLogout}>
                            <path
                                d="M0 0 C2.97922593 -0.02683987 5.95821295 -0.04676037 8.9375 -0.0625 C9.78763672 -0.07087891 10.63777344 -0.07925781 11.51367188 -0.08789062 C12.32255859 -0.09111328 13.13144531 -0.09433594 13.96484375 -0.09765625 C14.7137085 -0.10289307 15.46257324 -0.10812988 16.23413086 -0.11352539 C18 -0 18 -0 19 1 C19.04092937 3.33297433 19.04241723 5.66705225 19 8 C18.01 7.67 17.02 7.34 16 7 C16 5.68 16 4.36 16 3 C11.71 3 7.42 3 3 3 C3 9.27 3 15.54 3 22 C7.29 22 11.58 22 16 22 C16 20.35 16 18.7 16 17 C16.99 16.67 17.98 16.34 19 16 C19 18.64 19 21.28 19 24 C12.73 24 6.46 24 0 24 C-1.18807993 21.62384014 -1.12914522 20.1488258 -1.1328125 17.5 C-1.13410156 16.613125 -1.13539062 15.72625 -1.13671875 14.8125 C-1.13285156 13.884375 -1.12898437 12.95625 -1.125 12 C-1.12886719 11.071875 -1.13273438 10.14375 -1.13671875 9.1875 C-1.13542969 8.300625 -1.13414063 7.41375 -1.1328125 6.5 C-1.13168457 5.6853125 -1.13055664 4.870625 -1.12939453 4.03125 C-1 2 -1 2 0 0 Z"
                                fill="#FEFEFE" transform="translate(2,0)" />
                            <path
                                d="M0 0 C2.70931419 0.15481795 4.46584039 0.48172081 6.4453125 2.40234375 C7.67679642 3.89771708 8.8429837 5.4462924 10 7 C4.5 12 4.5 12 0 12 C0 11.01 0 10.02 0 9 C-1.98 9 -3.96 9 -6 9 C-6 7.02 -6 5.04 -6 3 C-4.02 3 -2.04 3 0 3 C0 2.01 0 1.02 0 0 Z"
                                fill="#FEFEFE" transform="translate(13,6)" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Navbar;