import React from 'react';
import { NavLink } from 'react-router-dom';

function NavbarVertical() {
    const navItems = [
        { title: 'Work Order', path: '/' },
        { title: 'Database', path: '/database' },
        {
            title: 'Management',
            children: [
                { title: 'Birch User Management', path: '/user_management' },
                { title: 'Team Member Management', path: '/team_member_management' },
                { title: 'Routing Matrix', path: '/routing_matrix' }
            ]
        },
        { title: 'Time Operation', path: '/time-operation' },
        {
            title: 'Report',
            children: [
                { title: 'Department Report', path: '/department_report' },
                {
                    title: 'Management Reports',
                    children: [
                        { title: 'Revenue by Customer', path: '/revenue_by_customer' },
                        { title: 'Revenue by Department', path: '/revenue_by_department' },
                    ]
                }
            ]
        }
    ];


    const renderMenuItems = (items) => {
        return items.map((item, index) => {
            if (item.children && item.children.length > 0) {
                return (
                    <li key={index}>
                        <details>
                            <summary>{item.title}</summary>
                            <ul className='submenu z-10 bg-[#002E54]'>
                                {renderMenuItems(item.children)}
                            </ul>
                        </details>
                    </li>
                );
            } else {
                return (
                    <li key={index}>
                        <NavLink to={item.path} activeClassName="active">
                            {item.title}
                        </NavLink>
                    </li>
                );
            }
        });
    };

    return (
        <div className={`w-full p-0 mx-auto`}>
            <div className="hidden lg:flex md:flex justify-between bg-[#002E54] text-white w-full items-center px-[20px]">
                <ul className="menu menu-horizontal px-0 font-medium flex justify-between text-[16px]">
                    {renderMenuItems(navItems)}
                </ul>
                <div className="h-fit flex items-center my-2">
                    <div className="ml-[24px] tooltip tooltip-bottom" data-tip="Log Out">
                        {/* Log Out functionality or icon */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NavbarVertical;
