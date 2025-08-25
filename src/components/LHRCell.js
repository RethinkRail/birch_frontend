import { useEffect, useState } from "react";
import axios from "axios";

const LHRCell = ({ workOrder, workId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchLhr = async () => {
            try {
                const { data } = await axios.get(process.env.REACT_APP_BIRCH_API_URL+"get_lhr", {
                    params: { work_order: workOrder, work_id: workId }
                });
                if (isMounted) {
                    setData(data);
                }
            } catch (err) {
                console.error("Failed to fetch LHR:", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchLhr();
        return () => { isMounted = false; };
    }, [workOrder, workId]);

    return (
        <span
            className="cursor-alias tooltip tooltip-right before:whitespace-pre-wrap before:content-[attr(data-tip)]"
            data-tip={
                data
                    ? `Estimated Hour: ${data.totalEstimatedHours.toFixed(2)}\nHours Applied: ${data.totalAppliedHours.toFixed(2)}`
                    : "Loading..."
            }
        >
      {loading ? "..." : `${data.percentage.toFixed(2)}%`}
    </span>
    );
};

export default LHRCell;
