/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/2/2024, Friday
 * Description:
 **/
import {addDays, convertSqlWithTZToFormattedDate} from "./DateTimeHelper";

const getUniqueParts = (jobs) => {
    const partsMap = new Map();

    jobs.forEach(job => {
        job.jobparts.forEach(part => {

            const { code, title, price,part_condition } = part.parts;
            const { quantity, purchase_cost, availability,additional_info } = part;

            if (partsMap.has(code)) {
                const existingPart = partsMap.get(code);
                existingPart.quantity += quantity;

            } else {
                partsMap.set(code, {
                    code,
                    title,
                    purchase_cost,
                    price,
                    quantity,
                    part_condition,
                    availability,
                    additional_info
                });
            }
        });
    });

    return Array.from(partsMap.values());
};
const json_item = {
    "id": 1484,
    "work_order": "WO_01432",
    "spot": {
        "id": 1,
        "spot": 1,
        "track": {
            "id": 1,
            "name": "R1",
            "spots": [],
            "yard": {
                "id": 1,
                "name": "BOEING FREIGHT SERVICE",
                "splc": "684441",
                "abbreviation": "BFSB",
                "address": "PO BOX 12746 BEAUMONT, TX 77726",
                "detail_source": "SH",
                "facility_type": "CS",
                "billing_address": "BENEFICIARY ACCOUNT NAME: BOEING FREIGHT SERVICE LLC\nBANK ACCOUNT NUMBER: 32343412\nROUTING NUMBER: 432122",
                "tracks": []
            }
        }
    },
    "reason_to_come": "BACKHOE WILL NOT GO FORWARD OR REVERSE",
    "inspector": {
        "id": "9",
        "name": "mithun"
    },
    "status": {
        "code": 90,
        "title": "PROJECTS/MAINTENANCE",
        "comment": "MAINT / PROJECT"
    },
    "railcar": {
        "rfid": "IHMT000100",
        "car_type": {
            "id": 13,
            "short_name": "BFS",
            "name": "BAIR SERVICE",
            "description": ""
        },
        "last_product": {
            "id": 137,
            "name": "MAINTENANCE"
        },
        "el_index": "U",
        "owner": {
            "id": 35,
            "name": "BAIR SERVICE",
            "abbreviation": "IHRX",
            "labor_rate": 85,
            "markup": 0.25999999046325684,
            "is_po": "no"
        },
        "lessee": {
            "id": 35,
            "name": "BAIR SERVICE"
        }
    },
    "joblist": [
        {
            "job_id": 17559,
            "ln": 1,
            "loc": {
                "code": "AB",
                "title": "Entire Car"
            },
            "qty": 1,
            "cc": {
                "code": 1,
                "title": "NEW MATERIAL APPLIED"
            },
            "jc": {
                "code": 4999,
                "title": "MISCELLANIOUS - GENERAL",
                "description": "MISCELLANIOUS - GENERAL",
                "time_custom": 0,
                "time_standard": 0,
                "revenue_category_primary": "REPAIR"
            },
            "aq": {
                "id": null,
                "code": null,
                "title": null,
                "description": null
            },
            "des": "ASCO TO COME OUT AND DIAGNOSE BACKHOE ISSUE ($375 FOR INITIAL CALL OUT, $185 PER ADDITIONAL HOUR, $4.25 PER MILE TRAVEL). ESTIMATED FIX AT $2,500.",
            "wmc": {
                "code": "25",
                "title": "Owner's request",
                "description": null
            },
            "jcr": {
                "code": 4999,
                "title": "MISCELLANIOUS - GENERAL",
                "description": "MISCELLANIOUS - GENERAL",
                "time_custom": 0,
                "time_standard": 0,
                "revenue_category_primary": "REPAIR"
            },
            "rq": {
                "id": null,
                "code": null,
                "title": null,
                "description": null
            },
            "rc": {
                "code": 1,
                "title": "Owner",
                "description": null
            },
            "parts": [
                {
                    "id": 52349,
                    "code": "80-18000006",
                    "name": "SUBCONTRACTED MATERIAL AND LABOR",
                    "purchase_cost": 0,
                    "quantity": 1,
                    "markup_percent": 0.25999999046325684,
                    "part_condition": 1,
                    "totalcost": 0,
                    "availability": 1,
                    "additional_info": "Acso call out",
                    "rev_primary": "REPAIR"
                }
            ],
            "labor_rate": 45,
            "labor_time": 0,
            "labor_cost": 0,
            "material_cost": 0,
            "net_cost": 0,
            "secondary_bill_to_id": null,
            "checked_by_crew_id": 71,
            "crew_checked_time": "2024-04-26 16:14:48.000000",
            "qa_checked_by": null,
            "qa_checked_time": null,
            "manager_checked_by": null,
            "manager_checked_time": null,
            "comment": null,
            "logged_time_timetracking": 0
        },
        {
            "job_id": 17557,
            "ln": 2,
            "loc": {
                "code": "AB",
                "title": "Entire Car"
            },
            "qty": 1,
            "cc": {
                "code": 0,
                "title": "LABOR ATTENTION"
            },
            "jc": {
                "code": 4450,
                "title": "LABOR FREIGHT CAR",
                "description": "REPAIR, RENEW, REMOVE, REPLACE AND/OR STRAIGHTEN PARTS IN PLACE ON FREIGHT CARS, WHERE NOT COVERED BY A SPECIFIC JOB CODE. INCLUDES ALL APPLICABLE OVERHEADS PER OFFICE MANUAL RULE 111. NET LABOR PER HOUR.",
                "time_custom": 1,
                "time_standard": 1,
                "revenue_category_primary": "REPAIR"
            },
            "aq": {
                "id": null,
                "code": null,
                "title": null,
                "description": null
            },
            "des": "MAINTENACE LABOR TO FACILITATE ASCO ON SIGHT AND ASSIST WHEN NEEDED.  NOT INTENDED FOR MAINTENANCE TO SIT AND WATCH",
            "wmc": {
                "code": "25",
                "title": "Owner's request",
                "description": null
            },
            "jcr": {
                "code": 4450,
                "title": "LABOR FREIGHT CAR",
                "description": "REPAIR, RENEW, REMOVE, REPLACE AND/OR STRAIGHTEN PARTS IN PLACE ON FREIGHT CARS, WHERE NOT COVERED BY A SPECIFIC JOB CODE. INCLUDES ALL APPLICABLE OVERHEADS PER OFFICE MANUAL RULE 111. NET LABOR PER HOUR.",
                "time_custom": 1,
                "time_standard": 1,
                "revenue_category_primary": "REPAIR"
            },
            "rq": {
                "id": null,
                "code": null,
                "title": null,
                "description": null
            },
            "rc": {
                "code": 1,
                "title": "Owner",
                "description": null
            },
            "parts": [],
            "labor_rate": 45,
            "labor_time": 3,
            "labor_cost": 135,
            "material_cost": 0,
            "net_cost": 135,
            "secondary_bill_to_id": null,
            "checked_by_crew_id": 71,
            "crew_checked_time": "2024-04-26 16:14:51.000000",
            "qa_checked_by": null,
            "qa_checked_time": null,
            "manager_checked_by": null,
            "manager_checked_time": null,
            "comment": null,
            "logged_time_timetracking": 1490
        },
        {
            "job_id": 17558,
            "ln": 3,
            "loc": {
                "code": "AB",
                "title": "Entire Car"
            },
            "qty": 1,
            "cc": {
                "code": 0,
                "title": "LABOR ATTENTION"
            },
            "jc": {
                "code": 4450,
                "title": "LABOR FREIGHT CAR",
                "description": "REPAIR, RENEW, REMOVE, REPLACE AND/OR STRAIGHTEN PARTS IN PLACE ON FREIGHT CARS, WHERE NOT COVERED BY A SPECIFIC JOB CODE. INCLUDES ALL APPLICABLE OVERHEADS PER OFFICE MANUAL RULE 111. NET LABOR PER HOUR.",
                "time_custom": 1,
                "time_standard": 1,
                "revenue_category_primary": "REPAIR"
            },
            "aq": {
                "id": null,
                "code": null,
                "title": null,
                "description": null
            },
            "des": "PROJECT SHOULD BE ESTIMATED FOLLOWING ASCO'S DIAGNOSIS",
            "wmc": {
                "code": "25",
                "title": "Owner's request",
                "description": null
            },
            "jcr": {
                "code": 4450,
                "title": "LABOR FREIGHT CAR",
                "description": "REPAIR, RENEW, REMOVE, REPLACE AND/OR STRAIGHTEN PARTS IN PLACE ON FREIGHT CARS, WHERE NOT COVERED BY A SPECIFIC JOB CODE. INCLUDES ALL APPLICABLE OVERHEADS PER OFFICE MANUAL RULE 111. NET LABOR PER HOUR.",
                "time_custom": 1,
                "time_standard": 1,
                "revenue_category_primary": "REPAIR"
            },
            "rq": {
                "id": null,
                "code": null,
                "title": null,
                "description": null
            },
            "rc": {
                "code": 1,
                "title": "Owner",
                "description": null
            },
            "parts": [],
            "labor_rate": 85,
            "labor_time": 0,
            "labor_cost": 0,
            "material_cost": 0,
            "net_cost": 0,
            "secondary_bill_to_id": null,
            "checked_by_crew_id": 71,
            "crew_checked_time": "2024-04-26 16:15:08.000000",
            "qa_checked_by": null,
            "qa_checked_time": null,
            "manager_checked_by": null,
            "manager_checked_time": null,
            "comment": null,
            "logged_time_timetracking": 0
        },
        {
            "job_id": 20953,
            "ln": 4,
            "loc": {
                "code": "AB",
                "title": "Entire Car"
            },
            "qty": 1,
            "cc": {
                "code": 1,
                "title": "NEW MATERIAL APPLIED"
            },
            "jc": {
                "code": 4999,
                "title": "MISCELLANIOUS - GENERAL",
                "description": "MISCELLANIOUS - GENERAL",
                "time_custom": 0,
                "time_standard": 0,
                "revenue_category_primary": "REPAIR"
            },
            "aq": {
                "id": null,
                "code": null,
                "title": null,
                "description": null
            },
            "des": "FINAL INVOICE FROM ASCO",
            "wmc": {
                "code": "25",
                "title": "Owner's request",
                "description": null
            },
            "jcr": {
                "code": 4999,
                "title": "MISCELLANIOUS - GENERAL",
                "description": "MISCELLANIOUS - GENERAL",
                "time_custom": 0,
                "time_standard": 0,
                "revenue_category_primary": "REPAIR"
            },
            "rq": {
                "id": null,
                "code": null,
                "title": null,
                "description": null
            },
            "rc": {
                "code": 1,
                "title": "Owner",
                "description": null
            },
            "parts": [
                {
                    "id": 52349,
                    "code": "80-18000006",
                    "name": "SUBCONTRACTED MATERIAL AND LABOR",
                    "purchase_cost": 3511,
                    "quantity": 1,
                    "markup_percent": 0,
                    "part_condition": 1,
                    "totalcost": 3511,
                    "availability": 1,
                    "additional_info": "Asco Call out",
                    "rev_primary": "REPAIR"
                }
            ],
            "labor_rate": 185,
            "labor_time": 0,
            "labor_cost": 0,
            "material_cost": 3511,
            "net_cost": 3511,
            "secondary_bill_to_id": null,
            "checked_by_crew_id": 71,
            "crew_checked_time": "2024-04-26 16:14:57.000000",
            "qa_checked_by": null,
            "qa_checked_time": null,
            "manager_checked_by": null,
            "manager_checked_time": null,
            "comment": null,
            "logged_time_timetracking": 0
        }
    ],
    "updates": [
        {
            "update_date": "2024-03-27T18:33:33.000Z",
            "user_name": "Steve",
            "spot": {
                "id": 1,
                "spot": 1,
                "track": {
                    "id": 1,
                    "name": "R1",
                    "spots": []
                }
            },
            "status": {
                "code": 100,
                "title": "ENROUTE",
                "comment": "CREATED BY STEVE"
            }
        },
        {
            "update_date": "2024-03-27 13:41:16.000000",
            "user_name": "Steve",
            "spot": {
                "id": 1,
                "spot": 1,
                "track": {
                    "id": 1,
                    "name": "R1",
                    "spots": []
                }
            },
            "status": {
                "code": 90,
                "title": "PROJECTS/MAINTENANCE",
                "comment": "BACKHOE - WILL NOT GO FORWARD OR BACKWARDS"
            }
        },
        {
            "update_date": "2024-03-27T19:17:33.000Z",
            "user_name": "april_s",
            "spot": {
                "id": 1,
                "spot": 1,
                "track": {
                    "id": 1,
                    "name": "R1",
                    "spots": []
                }
            },
            "status": {
                "code": 100,
                "title": "ENROUTE",
                "comment": "PUSH"
            }
        },
        {
            "update_date": "2024-03-27T19:18:12.000Z",
            "user_name": "april_s",
            "spot": {
                "id": 1,
                "spot": 1,
                "track": {
                    "id": 1,
                    "name": "R1",
                    "spots": []
                }
            },
            "status": {
                "code": 100,
                "title": "ENROUTE",
                "comment": "PUSH"
            }
        },
        {
            "update_date": "2024-03-28 00:32:34.000000",
            "user_name": "Steve",
            "spot": {
                "id": 1,
                "spot": 1,
                "track": {
                    "id": 1,
                    "name": "R1",
                    "spots": []
                }
            },
            "status": {
                "code": 90,
                "title": "PROJECTS/MAINTENANCE",
                "comment": "DIAGNOSE BACKHOE, REPAIR"
            }
        },
        {
            "update_date": "2024-07-09T21:16:10.000Z",
            "user_name": "mallory",
            "spot": {
                "id": 1,
                "spot": 1,
                "track": {
                    "id": 1,
                    "name": "R1",
                    "spots": []
                }
            },
            "status": {
                "code": 151,
                "title": "UNDER INSPECTION (PHYSICAL)",
                "comment": "MOVING ROUTING"
            }
        },
        {
            "update_date": "2024-07-10T00:27:54.000Z",
            "user_name": "richard",
            "spot": {
                "id": 1,
                "spot": 1,
                "track": {
                    "id": 1,
                    "name": "R1",
                    "spots": []
                }
            },
            "status": {
                "code": 153,
                "title": "UNDER ESTIMATION (DATA ENTRY)",
                "comment": "COMPLETE"
            }
        },
        {
            "update_date": "2024-07-10T00:30:33.000Z",
            "user_name": "richard",
            "spot": {
                "id": 1,
                "spot": 1,
                "track": {
                    "id": 1,
                    "name": "R1",
                    "spots": []
                }
            },
            "status": {
                "code": 153,
                "title": "UNDER ESTIMATION (DATA ENTRY)",
                "comment": "COMPLETE"
            }
        },
        {
            "update_date": "2024-07-29 14:56:15.000000",
            "user_name": "richard",
            "spot": {
                "id": 1,
                "spot": 1,
                "track": {
                    "id": 1,
                    "name": "R1",
                    "spots": []
                }
            },
            "status": {
                "code": 90,
                "title": "PROJECTS/MAINTENANCE",
                "comment": "MAINT / PROJECT"
            }
        }
    ],
    "invoice_number": "",
    "days_in_status": 3,
    "days_in_facility": 128,
    "locked_by": null,
    "arrival_date": "2024-03-27T00:00:00.000Z",
    "inspected_date": "1900-01-01T06:00:00.000Z",
    "estimated_date": "1900-01-01T06:00:00.000Z",
    "approved_date": "1900-01-01T06:00:00.000Z",
    "clean_date": "1900-01-01T06:00:00.000Z",
    "blast_date": "1900-01-01T06:00:00.000Z",
    "repair_date": "1900-01-01T06:00:00.000Z",
    "valve_date": "1900-01-01T06:00:00.000Z",
    "valve_tear_down": "1900-01-01T06:00:00.000Z",
    "exterior_paint": "1900-01-01T06:00:00.000Z",
    "repair_schedule_date": "1900-01-01T06:00:00.000Z",
    "paint_date": "1900-01-01T06:00:00.000Z",
    "qa_date": "1900-01-01T06:00:00.000Z",
    "month_to_invoice": "1900-01-01T06:00:00.000Z",
    "mo_wk": "",
    "sp": null,
    "tq": null,
    "re": null,
    "ep": null,
    "pd_date": "1900-01-01T06:00:00.000Z",
    "final_date": "1900-01-01T06:00:00.000Z",
    "finished_date": "1900-01-01T06:00:00.000Z",
    "departure_date": "1900-01-01T06:00:00.000Z",
    "projected_out_date": "2024-05-11T00:00:00.000Z",
    "material_eta": "1900-01-01 00:00:00.000000",
    "invoice_date": "2024-03-27T13:33:30.000Z",
    "invoice_net_days": 30,
    "actual_labor_hours": null,
    "actual_labor_details": null,
    "purchase_order": "",
    "second_owner_obj": {
        "due_date": null,
        "invoice_date": null,
        "invoice_number": null,
        "purchase_order": null,
        "secondary_owner_id": null
    },
    "shipped_date": "1900-01-01 00:00:00.000000",
    "finalized_date": "1900-01-01 00:00:00.000000",
    "is_storage": 0,
    "locked_for_time_clocking": 0,
    "is_electrical": 0,
    "total_logged_time_timetracking": 1490,
    "routing_matrix": 5,
    "actual_labor_hours_ratio": 0.13666666666666666
}

const parts_for_bill = [
    {
        "id": 40729,
        "code": "06-2350028",
        "name": "DECAL. HOME SHOP",
        "purchase_cost": 10.640000343322754,
        "quantity": 2,
        "markup_percent": 0.25999999046325684,
        "part_condition": 1,
        "totalcost": 26.81280066223144,
        "availability": 1,
        "additional_info": null,
        "rev_primary": "pAINT/LINING"
    },
    {
        "id": 40745,
        "code": "06-2350044",
        "name": "DECAL. REMOVE BEFORE LOADING. 16X55 DYNAGRAPHICS",
        "purchase_cost": 9.4399995803833,
        "quantity": 2,
        "markup_percent": 0.25999999046325684,
        "part_condition": 1,
        "totalcost": 23.788798762512215,
        "availability": 1,
        "additional_info": null,
        "rev_primary": "pAINT/LINING"
    },
    {
        "id": 40766,
        "code": "06-2350065",
        "name": "DECAL. WARNING. DO NOT USE TAG. RED.",
        "purchase_cost": 0.7300000190734863,
        "quantity": 3,
        "markup_percent": 0.25999999046325684,
        "part_condition": 1,
        "totalcost": 2.7594000512123102,
        "availability": 1,
        "additional_info": null,
        "rev_primary": "pAINT/LINING"
    },
    {
        "id": 52150,
        "code": "18-5920008",
        "name": "TAMPER SEAL. CABLE MCLP180 2K 12IN W/LOGO  RED",
        "purchase_cost": 0.8600000143051147,
        "quantity": 1,
        "markup_percent": 0.25999999046325684,
        "part_condition": 1,
        "totalcost": 1.0836000098228453,
        "availability": 1,
        "additional_info": null,
        "rev_primary": "ADMIN"
    },
    {
        "id": 53609,
        "code": "68476-85-7-B",
        "name": "LIQUIFIED PETROLEUM GAS LPG BASE CLEANING",
        "purchase_cost": 1985,
        "quantity": 1,
        "markup_percent": 0,
        "part_condition": 1,
        "totalcost": 1985,
        "availability": 1,
        "additional_info": null,
        "rev_primary": "CLEAN"
    }
]

export function printATask(workOrder) {
    console.log("Print a task called")
    var p = 0.7;
    //var my_new_order = json_item;
    var rfid = workOrder.railcar_id;
    var car_type = workOrder.railcar.railcartype.short_name + " : " + workOrder.railcar.railcartype.name;
    var w_order = workOrder.work_order;
    var owner = workOrder.railcar.owner_railcar_owner_idToowner.name;
    var lessee = workOrder.railcar.owner_railcar_lessee_idToowner.name;
    var arr_date = convertSqlWithTZToFormattedDate(workOrder.arrival_date);

    var totalhours = 0;
    var task_table = '<table class="mytable forjobs">';
    var titles = ["LINE", "LOC", "Description of Repair", "QTY", "WMC", "Hrs"];
    var inital_cols = ["Date", "Tech Int.", "Sup Int.", "QA Int."];
    var n_row = "<tr style='background: lightgray; text-align: center'><td style='width: 20px;text-align: center'>" + titles.join("</td><td>") +
        "</td><td style='width: 80px; text-align: center';'>" + inital_cols.join("</td><td style='width: 80px; text-align: center'>") +
        "</td></tr>";
    task_table += n_row;
    workOrder.joblist.forEach((myjob, i) => {
        console.log(myjob)
        var tech_date = myjob.crew_checked_time == null ? "" : convertSqlWithTZToFormattedDate(myjob.crew_checked_time);
        var qa_date = myjob.qa_checked_time == null ? "" : convertSqlWithTZToFormattedDate(myjob.qa_checked_time);
        var manager_checked_time = myjob.manager_checked_time == null ? "" : convertSqlWithTZToFormattedDate(myjob.manager_checked_time);


        var hour = p * parseFloat(myjob.quantity) * parseFloat(myjob.labor_time);
        var row_html = "<tr style='line-height: 36px;'><td style='width: 20px;text-align: center'>" + myjob.line_number + "</td><td style='width: 20px'>" + myjob.locationcode.code + "</td>";
        row_html += "<td>" + myjob.job_description + "</td>";
        row_html += "<td>" + myjob.quantity + "</td>";
        row_html += "<td>" + ('0' + myjob.whymadecode.code) + "</td>";
        row_html += "<td>" + hour.toFixed(2) + "</td>";
        row_html += "<td>" + tech_date + "</td> <td style='background: lightgray; font-size: 10px;font-weight: bold'> " + getInitialsByNameId(myjob.crews?.name) + "</td><td style='font-size: 10px;font-weight: bold'>" + getInitialsByNameId(myjob.user_joblist_manager_checked_byTouser?.name) + '<br>' + manager_checked_time + "   </td><td style='background: lightgray; font-size: 10px;font-weight: bold'> " + getInitialsByNameId(myjob.user_joblist_qa_checked_byTouser?.name) + '<br>' + qa_date + "</td><tr>";
        row_html += "<tr><td style='border:0'></td><td style='border:0'>Qty</td><td style='border:0;padding-left: 10px'>Part #</td>";
        myjob.jobparts.forEach((part_item, p_i) => {
            var additional_info = part_item.additional_info ? ":" + part_item.additional_info : ""
            row_html += `<tr>
                            <td style='border:0'></td>
                            <td style='border:0'>${round2Dec(part_item.quantity)}</td>
                            <td style='border:0;padding-left: 10px'><strong>${part_item.parts.code}</strong>: ${part_item.parts.title}${additional_info}</td>
                         </tr>`
        });
        row_html += "<tr></tr>";
        totalhours = (hour + totalhours);
        task_table += row_html;
    });
    task_table += "</table>";
    var woTable = '<table class="mytable"><tr>' +
        '<td>Equipment:    ' +
        rfid +
        '</td><td>Owner:    ' +
        owner +
        '</td><td colspan="2" rowspan="3"><b>Total Hours:    ' +
        round2Dec(parseFloat(totalhours)).toString() +
        ' Hrs</b><tr><td>Work Order:    ' +
        w_order +
        '</td><td>Lessee:    ' +
        lessee +
        '<tr><td>Arrival Date:    ' +
        arr_date +
        '</td><td>Car Type:    ' +
        car_type +
        '</td></tr>' +
        '<tr>' + task_table + '</tr></table>';

    var tbl_title = "Workorder for " + workOrder.railcar_id;
    var tbl_name = "WO - " +workOrder.railcar_id+ "[" + w_order + "].pdf";
    saveDivII(woTable, tbl_title, tbl_name, true);
}

/**
 *  This method will generate BRC
 * @param workOrder  the work order
 * @param forWhom 1 - combined , 2 for owner , 3 lessee
 */
export function printBRC(workOrder,forWhom) {
    console.log("Print BRC Clicked")
    //var my_new_order = json_item;
    var yard = workOrder.yard.name + " - " + workOrder.yard.address;
    var rfid = workOrder.railcar_id;
    var car_type = workOrder.railcar.railcartype.short_name + " : " + workOrder.railcar.railcartype.name;
    var w_order = workOrder.work_order;
    var owner = workOrder.railcar.owner_railcar_owner_idToowner.name;
    var lessee = workOrder.railcar.owner_railcar_lessee_idToowner.name;
    var arr_date = convertSqlWithTZToFormattedDate(workOrder.arrival_date);


    var splc = workOrder.yard.splc;
    var rep_date = convertSqlWithTZToFormattedDate(workOrder.repair_date);
    var app_by = "";
    var facility_type = workOrder.yard.facility_type;
    var detail_source = workOrder.yard.detail_source;
    var sTable = '<table class="mytable"><tr>' +
        '<td>Work Order:    ' +
        w_order +
        '</td><td>Equipment:    ' +
        rfid +
        '</td><td>Owner:    ' +
        owner +
        '</td><td>Lessee:    ' +
        lessee +
        '</td><td>AAR Car Type:    ' +
        car_type +
        '</td></tr>' +
        '<tr><td colspan="2">Repaired At:    ' +
        yard +
        '</td><td>SPLC:    ' +
        splc +
        '</td><td>Facilty Type:    ' +
        facility_type +
        '</td><td>Detail Source:    ' +
        detail_source +
        '</td></tr><tr>' +
        '<td>Arrival Date:    ' +
        arr_date +
        '</td><td>Repair Date:    ' +
        rep_date +
        '</td><td>DefectCard-Issuing Party:    ' +
        '</td><td>Bad Order:    ' +
        '</td><td>Bad Order DT:    ' +
        '</td></tr>';

    var job_table = "";
    var titles = ["LN", "LOC", "QTY", "CC", "JC", "AQ", "Description of Repair", "Revenue Category", "WMC", "JCR", "RQ", "RC", "Labor$", "Material$", "Net$"];
    var n_row = "<tr style='background: lightgray;'>";
    for (var i = 0; i < titles.length; i++) {
        if (i == 7) {
            n_row += "<td class='no-print'>" + titles[i] + "</td>"
        } else {
            n_row += "<td>" + titles[i] + "</td>"
        }
    }

    n_row += "</tr>";

    // var parts_for_bill = item.GetPartList();

    job_table += n_row;
    var netCost = 0.0;
    var laborCost = 0.0;
    var materialCost = 0.0;
    workOrder.joblist.forEach((myjob, i) => {

        if(forWhom==3){
            if(myjob.secondary_bill_to_id != null){
                var aq = myjob.qualifiercode_joblist_qualifier_applied_idToqualifiercode?.code || "";
                var rq = myjob.qualifiercode_joblist_qualifier_removed_idToqualifiercode?.code || "";
                aq = aq == null ? "" : aq;
                rq = rq == null ? "" : rq;
                var row_html = "<tr><td>" + myjob.line_number + "</td>";
                row_html += "<td>" + myjob.locationcode.code + "</td>";
                row_html += "<td>" + myjob.quantity + "</td>";
                row_html += "<td>" + myjob.conditioncode.code + "</td>";
                row_html += "<td>" + myjob.jobcode_joblist_job_code_appliedTojobcode.code + "</td>";
                row_html += "<td>" + aq + "</td>";
                row_html += "<td>" + myjob.job_description + "</td>";
                row_html += "<td class='no-print'>" + myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name + "</td>";
                row_html += "<td>" + ('0' + myjob.whymadecode.code).slice(-2) + "</td>";
                row_html += "<td>" + myjob.jobcode_joblist_job_code_removedTojobcode.code + "</td>";
                row_html += "<td>" + rq + "</td>";
                row_html += "<td>" + myjob.responsibilitycode.code + "</td>";
                row_html += "<td>" + dollarFormated(myjob.labor_cost) + "</td>";

                //total_material_cost +=item.quantity*round2Dec( item.purchase_cost * (1 + round2Dec(item.markup_percent) * 1))
                var mat_cost_single_job = 0.0;
                myjob.jobparts.forEach(function (part) {
                    //var single_part_cost = round2Dec(part.quantity) * (round2Dec(part.purchase_cost) * (1 + round2Dec(part.markup_percent) * 1))
                    //mat_cost_single_job += Number(round2Dec(single_part_cost))

                    const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                    const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                    const single_part_cost = Number(round2Dec(purchaseCost + markup));
                    mat_cost_single_job += Number(round2Dec(single_part_cost));
                });

                row_html += "<td>" + dollarFormated(mat_cost_single_job) + "</td>";
                row_html += "<td>" + dollarFormated(Number(round2Dec(myjob.labor_cost + mat_cost_single_job))) + "</td></tr>";
                netCost += round2Dec(myjob.labor_cost + mat_cost_single_job)
                laborCost += Number(round2Dec(myjob.labor_cost))
                //var rounded_mat_cost = round2Dec(mat_cost_single_job)
                materialCost += Number(round2Dec(mat_cost_single_job))
                job_table += row_html;
            }
        }else if (forWhom==2){
            if(myjob.secondary_bill_to_id == null){
                var aq = myjob.qualifiercode_joblist_qualifier_applied_idToqualifiercode?.code || "";
                var rq = myjob.qualifiercode_joblist_qualifier_removed_idToqualifiercode?.code || "";
                aq = aq == null ? "" : aq;
                rq = rq == null ? "" : rq;
                var row_html = "<tr><td>" + myjob.line_number + "</td>";
                row_html += "<td>" + myjob.locationcode.code + "</td>";
                row_html += "<td>" + myjob.quantity + "</td>";
                row_html += "<td>" + myjob.conditioncode.code + "</td>";
                row_html += "<td>" + myjob.jobcode_joblist_job_code_appliedTojobcode.code + "</td>";
                row_html += "<td>" + aq + "</td>";
                row_html += "<td>" + myjob.job_description + "</td>";
                row_html += "<td class='no-print'>" + myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name + "</td>";
                row_html += "<td>" + ('0' + myjob.whymadecode.code).slice(-2) + "</td>";
                row_html += "<td>" + myjob.jobcode_joblist_job_code_removedTojobcode.code + "</td>";
                row_html += "<td>" + rq + "</td>";
                row_html += "<td>" + myjob.responsibilitycode.code + "</td>";
                row_html += "<td>" + dollarFormated(myjob.labor_cost) + "</td>";

                //total_material_cost +=item.quantity*round2Dec( item.purchase_cost * (1 + round2Dec(item.markup_percent) * 1))
                var mat_cost_single_job = 0.0;
                myjob.jobparts.forEach(function (part) {
                    // var single_part_cost = round2Dec(part.quantity) * (round2Dec(part.purchase_cost) * (1 + round2Dec(part.markup_percent) * 1))
                    // mat_cost_single_job += Number(round2Dec(single_part_cost))

                    const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                    const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                    const single_part_cost = Number(round2Dec(purchaseCost + markup));
                    mat_cost_single_job += Number(round2Dec(single_part_cost));
                });

                row_html += "<td>" + dollarFormated(Number(round2Dec(mat_cost_single_job))) + "</td>";
                row_html += "<td>" + dollarFormated(myjob.labor_cost + mat_cost_single_job) + "</td></tr>";
                netCost += round2Dec(Number(round2Dec(myjob.labor_cost + mat_cost_single_job)))
                laborCost += Number(round2Dec(myjob.labor_cost))
                //var rounded_mat_cost = round2Dec(mat_cost_single_job)
                materialCost += Number(round2Dec(mat_cost_single_job))
                job_table += row_html;
            }
        }else {
            var aq = myjob.qualifiercode_joblist_qualifier_applied_idToqualifiercode?.code || "";
            var rq = myjob.qualifiercode_joblist_qualifier_removed_idToqualifiercode?.code || "";
            aq = aq == null ? "" : aq;
            rq = rq == null ? "" : rq;
            var row_html = "<tr><td>" + myjob.line_number + "</td>";
            row_html += "<td>" + myjob.locationcode.code + "</td>";
            row_html += "<td>" + myjob.quantity + "</td>";
            row_html += "<td>" + myjob.conditioncode.code + "</td>";
            row_html += "<td>" + myjob.jobcode_joblist_job_code_appliedTojobcode.code + "</td>";
            row_html += "<td>" + aq + "</td>";
            row_html += "<td>" + myjob.job_description + "</td>";
            row_html += "<td class='no-print'>" + myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name + "</td>";
            row_html += "<td>" + ('0' + myjob.whymadecode.code).slice(-2) + "</td>";
            row_html += "<td>" + myjob.jobcode_joblist_job_code_removedTojobcode.code + "</td>";
            row_html += "<td>" + rq + "</td>";
            row_html += "<td>" + myjob.responsibilitycode.code + "</td>";
            row_html += "<td>" + dollarFormated(myjob.labor_cost) + "</td>";

            //total_material_cost +=item.quantity*round2Dec( item.purchase_cost * (1 + round2Dec(item.markup_percent) * 1))
            var mat_cost_single_job = 0.0;
            myjob.jobparts.forEach(function (part) {
                // var single_part_cost = round2Dec(part.quantity) * (round2Dec(part.purchase_cost) * (1 + round2Dec(part.markup_percent) * 1))
                // mat_cost_single_job += Number(round2Dec(single_part_cost))
                const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                const single_part_cost = Number(round2Dec(purchaseCost + markup));
                mat_cost_single_job += Number(round2Dec(single_part_cost));
            });

            row_html += "<td>" + dollarFormated(mat_cost_single_job) + "</td>";
            row_html += "<td>" + dollarFormated(Number(round2Dec(myjob.labor_cost + mat_cost_single_job) ))+ "</td></tr>";
            netCost += round2Dec(Number(round2Dec(myjob.labor_cost + mat_cost_single_job)))
            laborCost += Number(round2Dec(myjob.labor_cost))
            //var rounded_mat_cost = round2Dec(mat_cost_single_job)
            materialCost += Number(round2Dec(mat_cost_single_job))
            job_table += row_html;
        }


    });
    var total_labor_cost = round2Dec(laborCost);
    var total_material_cost = round2Dec(materialCost);
    var total_net_cost = round2Dec(laborCost + materialCost);
    sTable += '<tr>' +
        '<table class="mytable forjobs">' +
        job_table +
        '<tr><td colspan=10 style="border:0;text-align: right;"><b>Sum: </b></td><td style="border:0;"></td><td style="border:0;"><b>' +
        dollarFormated(total_labor_cost) +
        '</b></td><td style="border:0;"><b>' +
        dollarFormated(total_material_cost) +
        '</b></td><td style="border:0;"><b>' +
        dollarFormated(total_net_cost) +
        '</b></td>' +
        '<tr><td colspan=10 style="border:0;text-align: right;"><b>Total:</b></td>' +
        '<td style="border:0;"></td><td style="border:0;"></td><td style="border:0;"></td><td style="border:0;"><b>' +
        dollarFormated(total_net_cost, true) +
        '</b></td></tr>' +
        '</table></tr>' +
        '</table>';

    var tbl_title = "Estimate report for " + workOrder.railcar_id;
    var tbl_name = "BRC - " + workOrder.railcar_id + "[" + workOrder.work_order + "].pdf";
    saveDivII(sTable, tbl_title, tbl_name, true);
}

/**
 *  This method will generate invoice
 * @param item  the work order
 * @param forWhom 1 - combined , 2 for owner , 3 lessee
 */
export function printInvoice(workorder, forWhom) {

    console.log("Print invoice clicked" + forWhom)

    //var my_new_order = json_item;
    let revenuewMap = new Map();
    let labor_cost= 0
    let material_cost= 0
    let net_cost= 0
    let total_hour= 0
    workorder.joblist.forEach((job)=>{
        if(forWhom ==3){
            if(job.secondary_bill_to_id != null){
                // labor_cost+= job.labor_cost;
                // material_cost+= job.material_cost;
                // net_cost+= (labor_cost+material_cost)
                // total_hour+= job.labor_time

                const laborCost = Number(round2Dec(job.labor_rate)) * Number(round2Dec(job.labor_time)) * Number(round2Dec(job.quantity));
                labor_cost += Number(round2Dec(laborCost));

                // Calculate labor hours
                const laborHours = Number(round2Dec(job.labor_time)) * job.quantity;
                total_hour += Number(round2Dec(laborHours));

                let mat_cost_for_a_job =0
                job.jobparts.forEach(part => {
                    const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                    const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                    const materialCost = Number(round2Dec(purchaseCost + markup));
                    mat_cost_for_a_job += Number(round2Dec(materialCost));
                });
                net_cost +=Number(round2Dec((labor_cost+material_cost)))

            }
        }else if(forWhom==2){
            if(job.secondary_bill_to_id == null){
                const laborCost = Number(round2Dec(job.labor_rate)) * Number(round2Dec(job.labor_time)) * Number(round2Dec(job.quantity));
                labor_cost += Number(round2Dec(laborCost));

                // Calculate labor hours
                const laborHours = Number(round2Dec(job.labor_time)) * job.quantity;
                total_hour += Number(round2Dec(laborHours));

                let mat_cost_for_a_job =0
                job.jobparts.forEach(part => {
                    const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                    const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                    const materialCost = Number(round2Dec(purchaseCost + markup));
                    mat_cost_for_a_job += Number(round2Dec(materialCost));
                });
                net_cost +=Number(round2Dec((labor_cost+material_cost)))
            }
        }else {
            const laborCost = Number(round2Dec(job.labor_rate)) * Number(round2Dec(job.labor_time)) * Number(round2Dec(job.quantity));
            labor_cost += Number(round2Dec(laborCost));

            // Calculate labor hours
            const laborHours = Number(round2Dec(job.labor_time)) * job.quantity;
            total_hour += Number(round2Dec(laborHours));

            let mat_cost_for_a_job =0
            job.jobparts.forEach(part => {
                const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                const materialCost = Number(round2Dec(purchaseCost + markup));
                mat_cost_for_a_job += Number(round2Dec(materialCost));
            });
            net_cost +=Number(round2Dec((labor_cost+material_cost)))
        }

    })
    var costs = {
        "labor_cost": labor_cost,
        "material_cost": material_cost,
        "net_cost": net_cost,
        "total_hour": total_hour
    };
    console.log(costs)

    var total_labor_cost = costs.labor_cost;
    var total_material_cost = costs.material_cost;
    var total_net_cost = costs.net_cost;
    var rfid = workorder.railcar_id;
    var yard_billing_address;
    var yard = workorder.yard;
    var yard_name = workorder.yard.name;
    if (yard != null) {
        yard_billing_address = yard.billing_address;
        yard_billing_address = yard_billing_address.replace('.', '\n');
    } else {
        yard_billing_address = ""
    }
    let purchase_order
    let owner_obj
    let yardAddress = workorder.yard.address
    let  net_days
    let due_date
    let inv_date
    let invoice_number
    if(forWhom==3){
        purchase_order =workorder.secondary_owner_info.purchase_order
        owner_obj = [{
            name:workorder.railcar.owner_railcar_lessee_idToowner.name,
            contact_name:workorder.railcar.owner_railcar_lessee_idToowner.contact_name,
            address_line1: workorder.railcar.owner_railcar_lessee_idToowner.address_line1,
            address_line2: workorder.railcar.owner_railcar_lessee_idToowner.address_line2,
            city: workorder.railcar.owner_railcar_lessee_idToowner.city,
            state: workorder.railcar.owner_railcar_lessee_idToowner.state,
            zip_code: workorder.railcar.owner_railcar_lessee_idToowner.zip_code
        }]
        invoice_number= workorder.secondary_owner_info.invoice_number
        inv_date= workorder.secondary_owner_info.invoice_date != null ?convertSqlWithTZToFormattedDate(workorder.secondary_owner_info.invoice_date ):""
        //ownerName=workorder.railcar.owner_railcar_lessee_idToowner.name
        net_days = workorder.secondary_owner_info.invoice_net_days
        due_date = workorder.secondary_owner_info.invoice_date != null ?  convertSqlWithTZToFormattedDate(workorder.secondary_owner_info.invoice_date,net_days):""
    }else {

        purchase_order = workorder.purchase_order
        owner_obj = [{
            name:workorder.railcar.owner_railcar_owner_idToowner.name,
            contact_name:workorder.railcar.owner_railcar_owner_idToowner.contact_name,
            address_line1: workorder.railcar.owner_railcar_owner_idToowner.address_line1,
            address_line2: workorder.railcar.owner_railcar_owner_idToowner.address_line2,
            city: workorder.railcar.owner_railcar_owner_idToowner.city,
            state: workorder.railcar.owner_railcar_owner_idToowner.state,
            zip_code: workorder.railcar.owner_railcar_owner_idToowner.zip_code
        }]
        invoice_number= workorder.invoice_number
        inv_date= workorder.invoice_date != process.env.REACT_APP_DEFAULT_DATE ?convertSqlWithTZToFormattedDate(workorder.invoice_date ):""

        //ownerName=workorder.railcar.owner_railcar_owner_idToowner.name
        net_days = workorder.invoice_net_days
        // console.log(workorder.invoice_date)
        // console.log(net_days)
        // console.log(addDays(workorder.invoice_date+net_days))
        // console.log(convertSqlWithTZToFormattedDate(workorder.invoice_date))
        due_date = workorder.invoice_date != process.env.REACT_APP_DEFAULT_DATE  ?  convertSqlWithTZToFormattedDate(workorder.invoice_date,net_days):""
        console.log(due_date)
    }

    var car_type = workorder.railcar.railcartype.short_name + " : " + workorder.railcar.railcartype.name;
    var w_order = workorder.work_order;
    // var ownerName = my_new_order.railcar.owner.name;
    // var owner_obj = $.grep(myyarddata.owners, function (obj) {
    //     return obj.id == my_new_order.railcar.owner.id
    // });
    // var owner_obj = [
    //     {
    //         contact_name: "Demo Contact Name",
    //         address_line1: "Demo Address line1",
    //         address_line2: "Owner Address line2",
    //         city: "CityA",
    //         state: "StateA",
    //         zip_code: "ZipCodeA"
    //     }
    // ]
    var owner_address = '';
    if (owner_obj != null && owner_obj.length > 0) {
        owner_obj = owner_obj[0];
        if (owner_obj.contact_name != '') {
            owner_address += owner_obj.contact_name + '\n';
        }
        owner_address += owner_obj.address_line1 + '\n' + owner_obj.address_line2 + '\n';
        owner_address += owner_obj.city + ', ' + owner_obj.state + ' ' + owner_obj.zip_code;
    }
    var lessee = workorder.railcar.owner_railcar_lessee_idToowner.name
    var splc = workorder.yard.splc;
    var arr_date = convertSqlWithTZToFormattedDate(workorder.arrival_date);
    var rep_date = convertSqlWithTZToFormattedDate(workorder.repair_date);



    let yard_bank_info = workorder.yard.billing_address;

    workorder.joblist.forEach((myjob, i) => {

        if(forWhom==3){
            if(myjob.secondary_bill_to_id != null){
                if (myjob.labor_cost > 0) {
                    if (revenuewMap.get(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name)) {
                        var new_val = revenuewMap.get(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name) + myjob.labor_cost;
                        revenuewMap.set(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name, new_val)
                    } else {
                        revenuewMap.set(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name, myjob.labor_cost)
                    }
                }
            }
        }else if(forWhom ==2){
            if(myjob.secondary_bill_to_id ==null){
                if (myjob.labor_cost > 0) {
                    if (revenuewMap.get(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name)) {
                        var new_val = revenuewMap.get(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name) + myjob.labor_cost;
                        revenuewMap.set(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name, new_val)
                    } else {
                        revenuewMap.set(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name, myjob.labor_cost)
                    }
                }
            }
        }else {
            if (myjob.labor_cost > 0) {
                if (revenuewMap.get(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name)) {
                    var new_val = revenuewMap.get(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name) + myjob.labor_cost;
                    revenuewMap.set(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name, new_val)
                } else {
                    revenuewMap.set(myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name, myjob.labor_cost)
                }
            }
        }

    })
    console.log(revenuewMap)
    let labor_category = "";
    for (let [key, value] of revenuewMap) {
        //console.log(key + " = " + value);
        labor_category += key + " - " + value + "( " + ((value * 100) / total_labor_cost).toFixed(2) + "% )<br/>"
    }

    console.log(labor_category)

    var showHideDetails = "document.getElementById(\'detailed_table_for_invoice\').style.display = this.checked?'':'none';";
    var showHideCheckbox = '<span class="no-print" style="font: 0.8rem Calibri;color:gray;">' +
        '<input type="checkbox" onclick ="' + showHideDetails + '">' +
        'Show order details</span>';

    var detailedTable = showHideCheckbox + '<table id="detailed_table_for_invoice" class="mytable forjobs" style="display:none;"><thead><tr style="background: lightgray;">' +
        '<td style="width:20%;">Item</td><td style="width:50%;">Description</td><td>Quantity</td><td>Rate</td><td>Amount</td><td>Revenue Category</td></tr>' +
        '</thead><tbody>';

    var total_material_cost = 0.0;
    var rate_per_line = 0;
    var total_job_line = 0;
    var all_parts_for_sort = [];
    workorder.joblist.forEach((myjob, i) => {
        if(forWhom==3){
            if(myjob.secondary_bill_to_id != null){
                myjob.jobparts.forEach(function (item) {
                    rate_per_line += myjob.labor_rate;
                    total_job_line++;
                    item.rev_primary = myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name
                    all_parts_for_sort.push(item)
                });
            }
        }else if(forWhom ==2){
            if(myjob.secondary_bill_to_id ==null){
                myjob.jobparts.forEach(function (item) {
                    rate_per_line += myjob.labor_rate;
                    total_job_line++;
                    item.rev_primary = myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name
                    all_parts_for_sort.push(item)
                });
            }
        }else {
            myjob.jobparts.forEach(function (item) {
                rate_per_line += myjob.labor_rate;
                total_job_line++;
                item.rev_primary = myjob.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name
                all_parts_for_sort.push(item)
            });
        }

    });
    console.log(all_parts_for_sort)
    console.log(all_parts_for_sort.sort(function (a, b) {
        return (a.parts.code > b.parts.code) ? 1 : ((b.parts.code > a.parts.code) ? -1 : 0);
    }))
    //sorting

    // var single_mat_cost =round2Dec(part.quantity)*(round2Dec( part.purchase_cost) * (1 + round2Dec(part.markup_percent) * 1))

    // mat_cost_for_job += Number(round2Dec(single_mat_cost))

    console.log(all_parts_for_sort)
    all_parts_for_sort.forEach(function (item) {
        console.log(item)
        //var single_mat_cost = round2Dec(item.quantity) * (round2Dec(item.purchase_cost) * (1 + round2Dec(item.markup_percent) * 1))
        //var single_mat_cost = item.quantity * round2Dec(item.purchase_cost) * (1 +item.markup_percent * 1)
        const purchaseCost = Number(round2Dec(item.purchase_cost)) * item.quantity;
        const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(item.markup_percent));
        const single_mat_cost = Number(round2Dec(purchaseCost + markup));

        //console.log(single_mat_cost)

        total_material_cost += Number(round2Dec(single_mat_cost))
        detailedTable += '<tr><td style="white-space: nowrap;">' + item.parts.code + '</td><td>' +
            item.parts.title + '</td><td style="text-align: right;">' +
            round2Dec(item.quantity) + '</td><td style="text-align: right;">' +
            dollarFormated(round2Dec(round2Dec(item.purchase_cost) * (1 + round2Dec(item.markup_percent) * 1))) + '</td><td style="text-align: right;">' +
            dollarFormated(round2Dec(item.quantity) * round2Dec(round2Dec(item.purchase_cost) * (1 + round2Dec(item.markup_percent) * 1))) + '</td><td>' + item.rev_primary + '</td></tr>';
    });


    detailedTable += '<tr><td style="white-space: nowrap;">Labor Cost(Average labor rate:' + round2Dec(rate_per_line / total_job_line) + ')</td><td>' + labor_category +
        '</td><td style="text-align: right;">' +
        '1' +
        '</td><td style="text-align: right;">' +
        dollarFormated(round2Dec(costs.labor_cost)) +
        '</td><td style="text-align: right;">' +
        dollarFormated(round2Dec(costs.labor_cost)) + '</td></tr>';

    detailedTable += '<tr style="line-height: 48px;"><td colspan=3 >' +
        '<textarea style="width: 100%;box-sizing: border-box;resize: none;border:0;background:none;" rows="2">PLEASE REACH OUT TO ACCOUNTING@IHRAIL.COM OR CUSTOMERSERVICE@IHRAIL.COM WITH QUESTIONS.</textarea>' +
        '</td><td style="text-align: left; font-weight:bold;"> Total' +
        '</td><td style="text-align: right;font-weight:bold;">' +
        dollarFormated(round2Dec(total_material_cost + costs.labor_cost), true) + '</td></tr>';

    detailedTable += '</tbody></table>';
    //sortTable("detailed_table_for_invoice",0)
    var summaryTable = '<table class="mytable forjobs">' +
        '<tr style="background: lightgray;"><td><b>Equipment</b></td><td><b>Repair Date</b></td><td><b>SPLC</b></td>' +
        '<td><b>Labor Cost</b></td><td><b>Material Cost</b></td><td><b>Net Cost</b></td><tr>' +
        '<tr><td>' +
        rfid +
        '</td><td>' +
        rep_date +
        '</td><td>' +
        splc +
        '</td><td>' +
        dollarFormated(round2Dec(costs.labor_cost)) +
        '</td><td>' +
        dollarFormated(round2Dec(total_material_cost)) +
        '</td><td>' +
        dollarFormated(round2Dec(costs.labor_cost + total_material_cost)) +
        '</td></tr>' +
        '<tr><td colspan=3 style="border:0;text-align: right;"><b>Sum:</b>' +
        '</td><td style="border:0"><b>' +
        dollarFormated(round2Dec(costs.labor_cost), true) +
        '</b></td><td style="border:0"><b>' +
        dollarFormated(round2Dec(total_material_cost), true) +
        '</b></td><td style="border:0"><b>' +
        dollarFormated(round2Dec(total_material_cost + costs.labor_cost), true) +
        '</b></td></tr>' +
        '<tr><td colspan=5 style="border:0;text-align: right;"><b>Total:</b>' +
        '</td><td style="border:0"><b>' +
        dollarFormated(round2Dec(total_material_cost + costs.labor_cost), true) +
        '</b></td></tr>' +
        '</table>';


    var invTable = '<table class="mytable" style="border-collapse: collapse;"><tr>' +
        '<td>' +
        yardAddress +
        '<td style="width:20px;"></td></td><td>' +
        '<table style="float: right; min-width: 200px; width:200px; border-collapse: collapse;">' +
        '<tr><td style="border: 1px solid black;">Date</td>' +
        '<td style="border: 1px solid black;">Invoice Number</td></tr>' +
        '<tr><td style="border: 1px solid black;">' +
        inv_date +
        '</td><td style="border: 1px solid black;">' +
        invoice_number+
        '</td></tr></table></td></tr>' +
        '<tr><td></td></tr>' +
        '<tr><td style="border: 1px solid black;">Bill To:</td><td></td>' +
        '<td style="border: 1px solid black;">Remit Payment To:</td>' +
        '</tr><tr><td style="border: 1px solid black;">' +
        '<textarea style="width: 100%;box-sizing: border-box;resize: none;border:0;background:none;" rows="10">' +
        owner_obj.name + '\n' + owner_address + '</textarea>' +
        '</td><td></td><td style="border: 1px solid black;">' +
        '<textarea style="width: 100%;box-sizing: border-box;resize: none;border:0;background:none;" rows="10">' +
        yard_name + '\n' + yardAddress + '\n\n' + yard_bank_info + ' </textarea>' +
        '</td></tr>' +
        '<tr><td></td></tr>' +
        '<tr><table style="border-collapse: collapse; min-width:100px;">' +
        '<tr><td></td><td></td>' +
        '<td style="border: 1px solid black;">Due</td>' +
        '<td style="border: 1px solid black;">Terms</td>' +
        '</tr><tr>' +
        '<td><input style="width: 100%;height: 100%; box-sizing: border-box;resize: none;border:0;background:none;" disabled></td>' +
        '<td><input style="width: 100%;height: 100%; box-sizing: border-box;resize: none;border:0;background:none;" disabled></td>' +
        '<td style="border: 1px solid black;">' +
        due_date + '</td>' +
        '<td style="border: 1px solid black;">' +
        net_days + '</td>' +
        '</tr></table></tr>' +
        '<br>' +
        '<tr>' + detailedTable + '</tr>' +
        '<br>' +
        '<tr>' + summaryTable + '</tr>' +
        '</table>';

    var invTableWithPurchase = '<table class="mytable" style="border-collapse: collapse;"><tr>' +
        '<td>' +
        yardAddress+
        '<td style="width:20px;"></td></td><td>' +
        '<table style="float: right; min-width: 350px; width:350px; border-collapse: collapse;">' +
        '<tr><td style="border: 1px solid black;">Date</td>' +
        '<td style="border: 1px solid black;">Invoice Number</td><td style="border: 1px solid black;">Purchase Order</td></tr>' +
        '<tr><td style="border: 1px solid black;">' +
        inv_date +
        '</td><td style="border: 1px solid black;">' +
        invoice_number +
        '</td><td style="border: 1px solid black;">' + purchase_order + '</tr></table></td></tr>' +
        '<tr><td></td></tr>' +
        '<tr><td style="border: 1px solid black;">Bill To:</td><td></td>' +
        '<td style="border: 1px solid black;">Remit Payment To:</td>' +
        '</tr><tr><td style="border: 1px solid black;">' +
        '<textarea style="width: 100%;box-sizing: border-box;resize: none;border:0;background:none;" rows="10">' +
        owner_obj.name + '\n' + owner_address + '</textarea>' +
        '</td><td></td><td style="border: 1px solid black;">' +
        '<textarea style="width: 100%;box-sizing: border-box;resize: none;border:0;background:none;" rows="10">' +
        yard_name + '\n' + yard_billing_address + '\n\n' + yard_bank_info + ' </textarea>' +
        '</td></tr>' +
        '<tr><td></td></tr>' +
        '<tr><table style="border-collapse: collapse; min-width:100px;">' +
        '<tr><td></td><td></td>' +
        '<td style="border: 1px solid black;">Due</td>' +
        '<td style="border: 1px solid black;">Terms</td>' +
        '</tr><tr>' +
        '<td><input style="width: 100%;height: 100%; box-sizing: border-box;resize: none;border:0;background:none;" disabled></td>' +
        '<td><input style="width: 100%;height: 100%; box-sizing: border-box;resize: none;border:0;background:none;" disabled></td>' +
        '<td style="border: 1px solid black;">' +
        due_date + '</td>' +
        '<td style="border: 1px solid black;">' +
        net_days + '</td>' +
        '</tr></table></tr>' +
        '<br>' +
        '<tr>' + detailedTable + '</tr>' +
        '<br>' +
        '<tr>' + summaryTable + '</tr>' +
        '</table>';


    var tbl_title = "Invoice " + invoice_number;
    var tbl_name = "Invoice " + invoice_number+ ".pdf";
    if (purchase_order == null || purchase_order === "") {
        saveDivII(invTable, tbl_title, tbl_name, true);
    } else {
        saveDivII(invTableWithPurchase, tbl_title, tbl_name, true);
    }
}


export function printBBOM(workOrder) {

    console.log(workOrder)

    const parts_for_bill = getUniqueParts(workOrder.joblist)
    console.log(parts_for_bill)
    // var parts_for_bill = parts_for_bill;

    var bomTable = '<table class="mytable forjobs"><thead><tr style="background: lightgray;"><td>Code</td><td>Title</td><td>Quantity</td><td>Condition</td><td>Availability</td><td>Additional Info</td></tr></thead><tbody>';
    parts_for_bill.forEach((item, i) => {
        console.log(item)
        var additional_info= item.additional_info?item.additional_info:""
        bomTable += '<tr><td style="white-space: nowrap;">' + item.code + '</td><td>' + item.title + '</td><td>' + round2Dec(item.quantity) + '</td><td>' + item.part_condition + '</td><td>' + item.availability + '</td><td style="width: 140px">' + additional_info+ '</td></tr>';
    });
    bomTable += '</tbody></table>';

    var tbl_title = "Bill of Material for "
    var tbl_name = "BOM - " +".pdf";
    saveDivII(bomTable, tbl_title, tbl_name, false);
}

function saveDivII(sTable, title, filename, landscape = false) {
    var style = "<style>";
    style = style + "div { text-transform: uppercase; }"
    style = style + "div { text-transform: uppercase; }"
    style = style + "textarea { text-transform: uppercase; }"
    style = style + "table{min-width: 46.41rem;max-width:58.16rem;width: 100%;font: 1rem Calibri;padding: 0.16rem 0.25rem;text-transform: uppercase;}"
    style = style + "table td{height: 2.08rem;}"
    style = style + ".forjobs{border-collapse: collapse; border:0.083rem solid lightgray;}"
    style = style + ".forjobs td{height: 1.67rem; border-collapse: collapse; border:0.083rem solid gray;}"
    style = style + " @media print { .no-print {display: none !important;}} ";
    style = style + "</style>";
    var page_size = ' height=750,width=563';
    if (landscape) {
        style = "<style>";
        style = style + "div { text-transform: uppercase; }"
        style = style + "input { text-transform: uppercase; }"
        style = style + "textarea { text-transform: uppercase; }"
        style = style + "table{min-width: 62.16rem; max-width:77.67rem; width: 100%;font:  1rem Calibri;padding: 0.16rem 0.25rem;text-transform: uppercase;}"
        style = style + "table td{height: 2.08rem;}"
        style = style + ".forjobs{border-collapse: collapse; border:0.083rem solid lightgray;}"
        style = style + ".forjobs td{height: 1.67rem; border-collapse: collapse; border:0.083rem solid gray;}"
        style = style + " @media print { .no-print {display: none !important;}} ";
        style = style + "</style>";
        var page_size = 'height=563,width=750';
    }

    var win = window.open('', '', page_size);
    win.document.write('<html><head>');
    win.document.write(
        '<img style="position:absolute; width:16.68rem;" src="' +
        process.env.PUBLIC_URL +
        '/logo.png">' +
        '<div style="text-align:center; margin:0.84rem; font: 1rem Calibri;">' +
        title +
        '</div><br>'
    );
    win.document.write(style);
    win.document.write('<title>' + filename + '</title>');
    win.document.write('</head>');
    win.document.write('<body><br>');
    win.document.write(sTable);
    win.document.write('</body>');
    win.document.write('</html>');
    win.document.close();
    win.print();
}

function dollarFormated(x, show_dollar = false, n_decimal = 2) {
    var txt = parseFloat(x).toFixed(n_decimal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    txt = (show_dollar ? "$" : "") + txt;
    return txt;
}

function round2Dec(value) {
    return Number(Math.round(value + 'e' + 2) + 'e-' + 2).toFixed(2);
}

function convertSecondsToDecimalHours(seconds) {
    var hours = Math.floor(seconds / 3600);
    var minutes = Math.floor((seconds % 3600) / 60);
    var decimalHours = hours + (minutes / 60);
    //return round2Dec(decimalHours); // Convert to decimal format with 2 decimal places
    return round2Dec(seconds / 3600); // Convert to decimal format with 2 decimal places
}

// function toUTCDateTime(actual_date_time){
//     return moment(actual_date_time).utc().format("YYYY-MM-DD HH:mm:ss")
// }

// Don't forget to handle the moment issues later
function UTCtoLocaleDateTime(date_time) {
    const currentTimeZone = 'UTC';
    const targetTimeZone = 'US/Central';
    // return moment.tz(date_time, currentTimeZone).tz(targetTimeZone).format("YYYY-MM-DD HH:mm:ss");
    return "2024-07-02 04:24:36"
}

function dateToString(lols) {
    return "August 4 2024"
}

function getInitialsByNameId(name) {
    if (!name) return '';

    // // Split the name by space and filter out empty strings
    // const nameParts = name.trim().split(' ').filter(part => part !== '');
    //
    // // Extract the first letter of each part and convert it to uppercase
    // const initials = nameParts.map(part => part.charAt(0).toUpperCase());
    //
    // // Join the initials and return as a string
    // return initials.join('');
    return name
}