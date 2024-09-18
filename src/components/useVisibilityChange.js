/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/18/2024, Wednesday
 * Description:
 **/

import { useEffect, useState } from 'react';

const useVisibilityChange = () => {
    const [isForeground, setIsForeground] = useState(true);
    useEffect(() => {
        const handleVisibilityChange = () => {
            setIsForeground(document.visibilityState === 'visible');
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
    return isForeground;
};
export default useVisibilityChange;