import {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {auth} from "../../firebase";

const Navbar = () => {
    const [isHoveredPrimary, setIsHoveredPrimary] = useState(false);
    const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
    const navigate = useNavigate();
    const handleLogout = async () => {
        await auth.signOut();
        localStorage.clear();
        return navigate('/auth/login');
    }


    const active_class = "bg-white hover:bg-[#efefef] text-[#002E54] py-2 px-3 h-[35px] my-auto flex mt-[px] pt-[9px] rounded-[6px]";
    const in_active_class = "py-2 hover:bg-[#1116] text-[#F2F4F7] px-3 rounded-[6px] flex items-center h-[45px]";

    const navbarItems = (
        <>
            <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/">Work Order</NavLink>
            <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                     to="/database">Database</NavLink>
            <div
                onMouseEnter={() => setIsHoveredPrimary(true)}
                onMouseLeave={() => {
                    if (!isSubmenuOpen) setIsHoveredPrimary(false);
                }}
                className="relative"
            >
                <NavLink
                    className={({isActive}) => isActive ? active_class : in_active_class}
                    to="/report"
                >
                    Report
                    <svg className="ml-[13px]" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="#D0D5DD" strokeWidth="2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                    </svg>
                </NavLink>
                {isHoveredPrimary && (
                    <ul
                        onMouseEnter={() => setIsSubmenuOpen(true)}
                        onMouseLeave={() => {
                            setIsSubmenuOpen(false);
                            setIsHoveredPrimary(false);
                        }}
                        className={`absolute left-0 top-full bg-[#002E54] py-[8px] px-[34px] border-t-[1px] border-gray-600 items-center flex justify-center gap-[12px] h-[45px] text-white opacity-0 whitespace-nowrap transform transition-all duration-300 ${isHoveredPrimary ? 'opacity-100 scale-100' : 'scale-0'}`}
                    >
                        <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/sublink1"
                                 onClick={() => setIsHoveredPrimary(false)}>submenu 1</NavLink>
                        <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/sublink2"
                                 onClick={() => setIsHoveredPrimary(false)}>submenu 2</NavLink>
                        <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/sublink3"
                                 onClick={() => setIsHoveredPrimary(false)}>submenu 3</NavLink>
                        <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/sublink4"
                                 onClick={() => setIsHoveredPrimary(false)}>submenu 4</NavLink>
                    </ul>
                )}
            </div>
        </>
    );

    return (
        <div className={`w-full p-0 mx-auto ${isHoveredPrimary ? "mb-[64px]" : ""}`}>
            <div
                className="hidden lg:flex md:flex justify-between bg-[#002E54] text-white w-full items-center px-[20px]">
                <ul className="menu menu-horizontal px-0 font-medium flex justify-between text-[16px]">
                    {navbarItems}
                </ul>
                <div className="h-fit flex items-center my-2">
                    <div className="ml-[24px] tooltip tooltip-bottom" data-tip="Log Out">
                        <svg className="ml-[24px] cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none"
                             xmlns="http://www.w3.org/2000/svg" onClick={handleLogout}>
                            <path
                                d="M0 0 C2.97922593 -0.02683987 5.95821295 -0.04676037 8.9375 -0.0625 C9.78763672 -0.07087891 10.63777344 -0.07925781 11.51367188 -0.08789062 C12.32255859 -0.09111328 13.13144531 -0.09433594 13.96484375 -0.09765625 C14.7137085 -0.10289307 15.46257324 -0.10812988 16.23413086 -0.11352539 C18 -0 18 -0 19 1 C19.04092937 3.33297433 19.04241723 5.66705225 19 8 C18.01 7.67 17.02 7.34 16 7 C16 5.68 16 4.36 16 3 C11.71 3 7.42 3 3 3 C3 9.27 3 15.54 3 22 C7.29 22 11.58 22 16 22 C16 20.35 16 18.7 16 17 C16.99 16.67 17.98 16.34 19 16 C19 18.64 19 21.28 19 24 C12.73 24 6.46 24 0 24 C-1.18807993 21.62384014 -1.12914522 20.1488258 -1.1328125 17.5 C-1.13410156 16.613125 -1.13539062 15.72625 -1.13671875 14.8125 C-1.13285156 13.884375 -1.12898437 12.95625 -1.125 12 C-1.12886719 11.071875 -1.13273438 10.14375 -1.13671875 9.1875 C-1.13542969 8.300625 -1.13414063 7.41375 -1.1328125 6.5 C-1.13168457 5.6853125 -1.13055664 4.870625 -1.12939453 4.03125 C-1 2 -1 2 0 0 Z"
                                fill="#FEFEFE" transform="translate(2,0)"
                            />
                            <path
                                d="M0 0 C2.70931419 0.15481795 4.46584039 0.48172081 6.4453125 2.40234375 C7.67679642 3.89771708 8.8429837 5.4462924 10 7 C4.5 12 4.5 12 0 12 C0 11.01 0 10.02 0 9 C-1.98 9 -3.96 9 -6 9 C-6 7.02 -6 5.04 -6 3 C-4.02 3 -2.04 3 0 3 C0 2.01 0 1.02 0 0 Z"
                                fill="#FEFEFE" transform="translate(13,6)"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;

