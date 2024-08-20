import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {auth} from "../../firebase";

const Navbar = ({ menuItems }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const [submenuOpen, setSubmenuOpen] = useState(null);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await auth.signOut();
        localStorage.clear();
        return navigate('/auth/login');
    };

    const activeClass = "bg-white hover:bg-[#efefef] text-[#002E54] py-2 px-3 h-[35px] my-auto flex mt-[px] pt-[9px] rounded-[6px]";
    const inactiveClass = "py-2 hover:bg-[#1116] text-[#F2F4F7] px-3 rounded-[6px] flex items-center h-[45px]";

    const renderMenuItems = () => {
        return Object.keys(menuItems).map((item, index) => {
            const itemValue = menuItems[item];
            console.log(item)
            console.log(itemValue)
            if (typeof itemValue === 'object') {

                return (
                    <div
                        key={index}
                        onMouseEnter={() => setHoveredItem(item)}
                        onMouseLeave={() => {
                            if (!submenuOpen) setHoveredItem(null);
                        }}
                        className="relative"
                    >
                        <NavLink
                            className={({ isActive }) => isActive ? activeClass : inactiveClass}
                            to={`/${item.toLowerCase()}`}
                        >
                            {item}
                            <svg className="ml-[13px]" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="#D0D5DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </NavLink>
                        {hoveredItem === item && (
                            <ul
                                onMouseEnter={() => setSubmenuOpen(item)}
                                onMouseLeave={() => {
                                    setSubmenuOpen(null);
                                    setHoveredItem(null);
                                }}
                                className={`absolute left-0 top-full bg-[#002E54] py-[8px] px-[34px] border-t-[1px] border-gray-600 items-center flex justify-center gap-[12px] h-[45px] text-white opacity-0 whitespace-nowrap transform transition-all duration-300 ${hoveredItem === item ? 'opacity-100 scale-100' : 'scale-0'}`}
                            >
                                {Object.keys(itemValue).map((subItem, subIndex) => (
                                    <React.Fragment key={subIndex}>
                                        {console.log(subItem)}
                                        <NavLink
                                            className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
                                            to={itemValue[subItem]}
                                            onClick={() => setHoveredItem(null)}
                                        >
                                            {subItem}
                                        </NavLink>
                                    </React.Fragment>
                                ))}

                            </ul>
                        )}
                    </div>
                );
            } else {
                return (
                    <NavLink
                        key={index}
                        className={({ isActive }) => isActive ? activeClass : inactiveClass}
                        to={itemValue}
                    >
                        {item}
                    </NavLink>
                );
            }
        });
    };

    return (
        <div className={`w-full p-0 mx-auto ${hoveredItem ? "mb-[64px]" : ""}`}>
            <div className="hidden lg:flex md:flex justify-between bg-[#002E54] text-white w-full items-center px-[20px]">
                <ul className="menu menu-horizontal px-0 font-medium flex justify-between text-[16px]">
                    {renderMenuItems()}
                </ul>
                <div className="h-fit flex items-center my-2">
                    <div className="ml-[24px] tooltip tooltip-bottom" data-tip="Log Out" onClick={handleLogout}>
                        <i className="fa fa-sign-out" aria-hidden="true"></i>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
