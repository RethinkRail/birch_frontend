
import React from 'react';
import 'daisyui/dist/full.css'; // Make sure to import DaisyUI CSS

const Navbar2 = () => {
    const navItems = [
        { name: 'Item 1', route: '/item1' },
        { name: 'Parent item', route: '/parent', submenu: [
                { name: 'Submenu 1', route: '/submenu1' },
                { name: 'Submenu 2', route: '/submenu2' },
                { name: 'Parent', submenu: [
                        { name: 'item 1', route: '/parent/item1' },
                        { name: 'item 2', route: '/parent/item2' }
                    ]}
            ]},
        { name: 'Item 3', route: '/item3' }
    ];

    return (
        <div className='w-full p-0 mx-auto'>
            <div className="hidden lg:flex md:flex justify-between bg-[#002E54] text-white w-full items-center px-[20px]">

            </div>
        </div>

    );
};

export default Navbar2;

