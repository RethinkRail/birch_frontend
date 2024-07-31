import Delete from "../components/Delete";
import Edit from "../components/Edit";

// Function to format the date
const formatDate = (dateString) => {
    if(dateString==null){
        return ''
    }
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString();
};

const handleGetColumn = (tableFields, handleEditRow, setRowId, setRowCode, setDeleteModalShowing) => {
    console.log(tableFields)
    const coreColumns = tableFields.map((field) => {
        // Check if the field is updatedAt and format the date
        if (field.Field.toLowerCase() === "last_update") {
            return {
                name: field.Field.split("_").join(" "),
                selector: row => row[field.Field],
                sortable: true,
                cell: (row) => {
                    return <span className={`max-w-[250px`}>{formatDate(row[field.Field]) || "_"}</span>;
                }
            };
        }

        if (field.Field.toLowerCase() === "id") {
            return {
                name: field.Field.split("_").join(" "),
                selector: row => row[field.Field],
                sortable: true,
                omit:true,
                cell: (row) => {
                    return <span className={`max-w-[250px`}>{formatDate(row[field.Field]) || "_"}</span>;
                }
            };
        }

        // if (field.Field.toLowerCase() === "id") {
        //     return {
        //         name: field.Field.split("_").join(" "),
        //         selector: row => row[field.Field],
        //         sortable: true,
        //         omit: true,
        //     };
        // }
        //


        return {
            name: field.Field.split("_").join(" "),
            selector: row => row[field.Field],
            sortable: true,
            cell: (row) => {
                return <span className={`max-w-[250px`}>{row[field.Field] }</span>;
            }
        };
    });

    return [
        { name: "Action", sortable: true, cell: (row) => (
                <span className="max-w-[100px] w-full flex flex-row items-center gap-[20px]">
        <span onClick={() => handleEditRow(row)} className="text-[10px] max-w-[100px] w-[15px] h-[15px] cursor-pointer">
          <Edit />
        </span>
        <span onClick={() => {
            setRowId(row.id);
            setRowCode(row.code);
            setDeleteModalShowing(true);
        }} className="text-[10px] max-w-[100px] w-[15px] h-[15px] cursor-pointer">
          <Delete />
        </span>
      </span>
            )},
        ...coreColumns
    ];
};

export default handleGetColumn;