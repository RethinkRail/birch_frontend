import {useState} from "react";
import {NavLink, useNavigate} from "react-router-dom";
import {auth} from "../../firebase";

const Navbar = () => {
    const [isHoveredPrimary, setIsHoveredPrimary] = useState(false);
    const [isHoveredSecondary, setIsHoveredSecondary] = useState(false);
    const navigate = useNavigate()
    const handleLogout = async() => {
        await auth.signOut();
        localStorage.clear();
        return navigate('/auth/login');
    }

    const handleMouseLeave = () => {
        setIsHoveredPrimary(false);
    };

    const handleHover2 = () => {
        setIsHoveredSecondary(true);
    };

    const handleMouseLeave2 = () => {
        setIsHoveredSecondary(false);
    };


    const [isSubMenuOpen, setSubMenuOpen] = useState(false);

    const handleMouseEnter = () => {
        setSubMenuOpen(true);
    };

    const handleMouseLeavew = () => {
        setSubMenuOpen(false);
    };


    const active_class = "bg-white hover:bg-[#efefef] text-[#002E54] py-2 px-3 h-[35px] my-auto flex mt-[px] pt-[9px] rounded-[6px]"
    const in_active_class = "py-2 hover:bg-[#1116]  text-[#F2F4F7] px-3 rounded-[6px] flex items-center h-[45px] "
    const navebarItems =
        <>
            <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/">Work Order</NavLink>
            <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                     to="/History">History</NavLink>
            <NavLink
                onMouseEnter={() => {
                    setIsHoveredPrimary(true)
                    setIsHoveredSecondary(false)
                }}
                onMouseOut={() => setIsHoveredSecondary(false)}
                className={({isActive}) => isActive ? active_class : in_active_class} to="/Report">
                Report
                <svg className="ml-[13px]" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="#D0D5DD" stroke-width="2" stroke-linecap="round"
                          stroke-linejoin="round"/>
                </svg>
            </NavLink>
            <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                     to="/Inventory"> Inventory</NavLink>
            <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                     to="/Database">Database</NavLink>
            <p onMouseEnter={() => setIsHoveredSecondary(true)}
               onMouseLeave={() => setIsHoveredPrimary(false)}
               className=" rounded-[6px]  ">
                <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/management">
                    Management
                    <svg className="ml-[12px]" width="24" height="24" viewBox="0 0 24 24" fill="none"
                         xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 9L12 15L18 9" stroke="#D0D5DD" stroke-width="2" stroke-linecap="round"
                              stroke-linejoin="round"/>
                    </svg>
                </NavLink>
            </p>
            <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                     to="/Storage">Storage</NavLink>

        </>
    return (
        <div className={`w-full p-0  mx-auto ${(isHoveredPrimary || isHoveredSecondary) && "mb-[64px]"}`}>
            <div>
                <div
                    className=" hidden lg:flex md:flex justify-between  bg-[#002E54] text-white w-full items-center px-[20px] ">
                    <ul className="menu menu-horizontal px-0  font-medium flex justify-between text-[16px]">
                        {navebarItems}
                    </ul>
                    <div className="h-fit flex items-center   my-2 ">
                        {/*<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                        {/*    <g clip-path="url(#clip0_112_1444)">*/}
                        {/*        <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 9.99996C12.5 8.61925 11.3807 7.49996 10 7.49996C8.61931 7.49996 7.50002 8.61925 7.50002 9.99996C7.50002 11.3807 8.61931 12.5 10 12.5Z" stroke="#D0D5DD" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />*/}
                        {/*        <path d="M15.6061 12.2727C15.5052 12.5012 15.4752 12.7547 15.5197 13.0004C15.5643 13.2462 15.6814 13.4729 15.8561 13.6515L15.9015 13.6969C16.0424 13.8376 16.1542 14.0048 16.2304 14.1887C16.3067 14.3726 16.3459 14.5698 16.3459 14.7689C16.3459 14.968 16.3067 15.1652 16.2304 15.3491C16.1542 15.533 16.0424 15.7002 15.9015 15.8409C15.7608 15.9817 15.5937 16.0935 15.4098 16.1697C15.2258 16.246 15.0287 16.2852 14.8296 16.2852C14.6305 16.2852 14.4333 16.246 14.2494 16.1697C14.0654 16.0935 13.8983 15.9817 13.7576 15.8409L13.7121 15.7954C13.5336 15.6208 13.3068 15.5036 13.0611 15.459C12.8153 15.4145 12.5619 15.4446 12.3334 15.5454C12.1093 15.6414 11.9182 15.8009 11.7836 16.0042C11.649 16.2074 11.5768 16.4456 11.5758 16.6894V16.8181C11.5758 17.22 11.4161 17.6054 11.132 17.8895C10.8479 18.1737 10.4625 18.3333 10.0606 18.3333C9.65878 18.3333 9.2734 18.1737 8.98925 17.8895C8.70511 17.6054 8.54548 17.22 8.54548 16.8181V16.75C8.53961 16.4992 8.45844 16.256 8.31253 16.052C8.16661 15.848 7.9627 15.6926 7.72729 15.606C7.4988 15.5052 7.24533 15.4751 6.99957 15.5197C6.75382 15.5642 6.52705 15.6814 6.34851 15.856L6.30305 15.9015C6.16233 16.0423 5.99523 16.1541 5.81129 16.2304C5.62736 16.3066 5.4302 16.3458 5.23108 16.3458C5.03197 16.3458 4.83481 16.3066 4.65087 16.2304C4.46693 16.1541 4.29983 16.0423 4.15911 15.9015C4.01824 15.7608 3.90648 15.5937 3.83023 15.4097C3.75398 15.2258 3.71474 15.0286 3.71474 14.8295C3.71474 14.6304 3.75398 14.4332 3.83023 14.2493C3.90648 14.0654 4.01824 13.8983 4.15911 13.7575L4.20457 13.7121C4.37922 13.5335 4.49637 13.3068 4.54093 13.061C4.58549 12.8153 4.55541 12.5618 4.45457 12.3333C4.35853 12.1092 4.19908 11.9181 3.99583 11.7835C3.79258 11.6489 3.5544 11.5767 3.31063 11.5757H3.18184C2.78 11.5757 2.39461 11.4161 2.11046 11.1319C1.82632 10.8478 1.66669 10.4624 1.66669 10.0606C1.66669 9.65872 1.82632 9.27334 2.11046 8.98919C2.39461 8.70505 2.78 8.54541 3.18184 8.54541H3.25002C3.50077 8.53955 3.74396 8.45838 3.94797 8.31247C4.15199 8.16655 4.30738 7.96264 4.39396 7.72723C4.4948 7.49874 4.52489 7.24527 4.48033 6.99951C4.43577 6.75376 4.31861 6.52699 4.14396 6.34844L4.09851 6.30299C3.95763 6.16227 3.84588 5.99517 3.76963 5.81123C3.69338 5.6273 3.65413 5.43013 3.65413 5.23102C3.65413 5.03191 3.69338 4.83474 3.76963 4.65081C3.84588 4.46687 3.95763 4.29977 4.09851 4.15905C4.23922 4.01818 4.40633 3.90642 4.59026 3.83017C4.7742 3.75392 4.97136 3.71468 5.17048 3.71468C5.36959 3.71468 5.56675 3.75392 5.75069 3.83017C5.93462 3.90642 6.10173 4.01818 6.24244 4.15905L6.2879 4.2045C6.46644 4.37915 6.69321 4.49631 6.93897 4.54087C7.18472 4.58543 7.43819 4.55535 7.66669 4.4545H7.72729C7.95136 4.35847 8.14246 4.19902 8.27706 3.99577C8.41166 3.79252 8.4839 3.55434 8.48487 3.31057V3.18178C8.48487 2.77993 8.6445 2.39455 8.92865 2.1104C9.21279 1.82626 9.59818 1.66663 10 1.66663C10.4019 1.66663 10.7872 1.82626 11.0714 2.1104C11.3555 2.39455 11.5152 2.77993 11.5152 3.18178V3.24996C11.5161 3.49374 11.5884 3.73191 11.723 3.93516C11.8576 4.13841 12.0487 4.29787 12.2727 4.3939C12.5012 4.49474 12.7547 4.52483 13.0005 4.48027C13.2462 4.43571 13.473 4.31855 13.6515 4.1439L13.697 4.09844C13.8377 3.95757 14.0048 3.84581 14.1887 3.76957C14.3727 3.69332 14.5698 3.65407 14.769 3.65407C14.9681 3.65407 15.1652 3.69332 15.3492 3.76957C15.5331 3.84581 15.7002 3.95757 15.8409 4.09844C15.9818 4.23916 16.0936 4.40627 16.1698 4.5902C16.2461 4.77414 16.2853 4.9713 16.2853 5.17041C16.2853 5.36953 16.2461 5.56669 16.1698 5.75063C16.0936 5.93456 15.9818 6.10167 15.8409 6.24238L15.7955 6.28784C15.6208 6.46638 15.5037 6.69315 15.4591 6.93891C15.4145 7.18466 15.4446 7.43813 15.5455 7.66663V7.72723C15.6415 7.9513 15.801 8.1424 16.0042 8.277C16.2075 8.4116 16.4456 8.48384 16.6894 8.48481H16.8182C17.22 8.48481 17.6054 8.64444 17.8896 8.92859C18.1737 9.21273 18.3334 9.59812 18.3334 9.99996C18.3334 10.4018 18.1737 10.7872 17.8896 11.0713C17.6054 11.3555 17.22 11.5151 16.8182 11.5151H16.75C16.5062 11.5161 16.2681 11.5883 16.0648 11.7229C15.8616 11.8575 15.7021 12.0486 15.6061 12.2727Z" stroke="#D0D5DD" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />*/}
                        {/*    </g>*/}

                        {/*</svg>*/}
                        {/*<svg className="ml-[24px]" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                        {/*    <path d="M7.79514 17.5C8.38275 18.0186 9.15462 18.3333 10 18.3333C10.8454 18.3333 11.6172 18.0186 12.2048 17.5M15 6.66663C15 5.34054 14.4732 4.06877 13.5355 3.13109C12.5978 2.19341 11.3261 1.66663 10 1.66663C8.67391 1.66663 7.40214 2.19341 6.46446 3.13109C5.52678 4.06877 5 5.34054 5 6.66663C5 9.24178 4.35039 11.0049 3.62472 12.1711C3.0126 13.1549 2.70654 13.6467 2.71777 13.7839C2.73019 13.9359 2.76238 13.9938 2.88481 14.0846C2.99538 14.1666 3.49382 14.1666 4.49071 14.1666H15.5093C16.5062 14.1666 17.0046 14.1666 17.1152 14.0846C17.2376 13.9938 17.2698 13.9359 17.2822 13.7839C17.2934 13.6467 16.9874 13.1549 16.3753 12.1711C15.6496 11.0049 15 9.24178 15 6.66663Z" stroke="#D0D5DD" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />*/}
                        {/*</svg>*/}

                        <div className="ml-[24px] tooltip  tooltip-bottom" data-tip="Log Out">
                            <svg className="ml-[24px] cursor-pointer" width="24" height="24" viewBox="0 0 24 24"
                                 fill="none" xmlns="http://www.w3.org/2000/svg" onClick={handleLogout}>
                                <path
                                    d="M0 0 C2.97922593 -0.02683987 5.95821295 -0.04676037 8.9375 -0.0625 C9.78763672 -0.07087891 10.63777344 -0.07925781 11.51367188 -0.08789062 C12.32255859 -0.09111328 13.13144531 -0.09433594 13.96484375 -0.09765625 C14.7137085 -0.10289307 15.46257324 -0.10812988 16.23413086 -0.11352539 C18 -0 18 -0 19 1 C19.04092937 3.33297433 19.04241723 5.66705225 19 8 C18.01 7.67 17.02 7.34 16 7 C16 5.68 16 4.36 16 3 C11.71 3 7.42 3 3 3 C3 9.27 3 15.54 3 22 C7.29 22 11.58 22 16 22 C16 20.35 16 18.7 16 17 C16.99 16.67 17.98 16.34 19 16 C19 18.64 19 21.28 19 24 C12.73 24 6.46 24 0 24 C-1.18807993 21.62384014 -1.12914522 20.1488258 -1.1328125 17.5 C-1.13410156 16.613125 -1.13539062 15.72625 -1.13671875 14.8125 C-1.13285156 13.884375 -1.12898437 12.95625 -1.125 12 C-1.12886719 11.071875 -1.13273438 10.14375 -1.13671875 9.1875 C-1.13542969 8.300625 -1.13414063 7.41375 -1.1328125 6.5 C-1.13168457 5.6853125 -1.13055664 4.870625 -1.12939453 4.03125 C-1 2 -1 2 0 0 Z "
                                    fill="#FEFEFE" transform="translate(2,0)"/>
                                <path
                                    d="M0 0 C2.70931419 0.15481795 4.46584039 0.48172081 6.4453125 2.40234375 C7.67679642 3.89771708 8.8429837 5.4462924 10 7 C4.5 12 4.5 12 0 12 C0 11.01 0 10.02 0 9 C-1.98 9 -3.96 9 -6 9 C-6 7.02 -6 5.04 -6 3 C-4.02 3 -2.04 3 0 3 C0 2.01 0 1.02 0 0 Z "
                                    fill="#FEFEFE" transform="translate(13,6)"/>
                            </svg>
                        </div>


                    </div>
                </div>
            </div>

            {isHoveredPrimary &&
                <ul
                    onMouseEnter={() => setIsHoveredPrimary(true)}
                    onMouseLeave={() => setIsHoveredPrimary(false)}
                    className={`bg-[#002E54] py-[8px] px-[34px]  border-t-[1px] border-gray-600 items-center  flex justify-center gap-[12px] h-[45px] text-white  opacity-0 whitespace-nowrap  transform transition-all duration-300 ${isHoveredPrimary ? 'opacity-100 scale-100' : 'scale-0'}`}>
                    <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/sublink1">submenu
                        1</NavLink>
                    <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/sublink2">submenu
                        2</NavLink>
                    <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                             to="/sublink3"> submenu 3</NavLink>
                    <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                             to="/submenu4"> submenu 4</NavLink>
                </ul>
            }

            {
                isHoveredSecondary &&
                <ul
                    onMouseEnter={() => setIsHoveredSecondary(true)}
                    onMouseLeave={() => setIsHoveredSecondary(false)}
                    className={`bg-[#002E54] py-[8px] px-[34px]  items-center gap-[12px] border-t-[1px] border-gray-600  text-white  h-[45px] opacity-0 whitespace-nowrap flex justify-center  transform transition-all duration-300 ${isHoveredSecondary ? 'opacity-100 scale-100' : 'scale-0'}`}>
                    <NavLink className={({isActive}) => isActive ? active_class : in_active_class} to="/BRC-User">BRC
                        User</NavLink>
                    <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                             to="/Crews"> Crews</NavLink>
                    <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                             to="/Routine-Matrix"> Routine Matrix</NavLink>
                    <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                             to="/management/Time-Approval"> Time Approval</NavLink>
                    <NavLink className={({isActive}) => isActive ? active_class : in_active_class}
                             to="/Rail Car Log"> Rail Car Log</NavLink>
                </ul>
            }


        </div>
    );
};

export default Navbar;

