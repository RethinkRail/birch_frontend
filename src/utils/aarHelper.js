/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 7/3/2024, Wednesday
 * Description:
 **/

import {round2Dec} from "./NumberHelper";

/**
 *  This method will generate 500 bytes AAR
 * @param item  the work order
 * @param _wheel_detail default false
 * @param forWhom 1 - combined , 2 for owner , 3 lessee
 */

export function printAAR(item, _wheel_detail = false, forWhom) {
    let data = null;
    let wheel_detail = _wheel_detail;
    let record_format = {
        name: 'record_format',
        column: 1,
        length: 1,
        formate: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let billing_invoicing_party = {
        name: 'billing_invoicing_party',
        column: 2,
        length: 4,
        formate: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let billed_party = {
        name: 'billed_party',
        column: 6,
        length: 4,
        formate: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let account_date = {
        name: 'account_date',
        column: 10,
        length: 4,
        formate: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let invoice_number = {
        name: 'invoice_number',
        column: 14,
        length: 16,
        formate: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let price_master_file_indicator = {
        name: 'price_master_file_indicator',
        column: 30,
        length: 1,
        formate: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let detail_source = {
        name: 'detail_source',
        column: 31,
        length: 2,
        formate: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let document_reference_number = {
        name: 'document_reference_number',
        column: 33,
        length: 15,
        formate: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let car_initial = {
        name: 'car_initial',
        column: 48,
        length: 4,
        formate: 'A',
        wheel_detail: wheel_detail,
        value: null
    };
    let car_number = {name: 'car_number', column: 52, length: 6, formate: 'N', wheel_detail: wheel_detail, value: null};
    let kind_of_car_symbol = {
        name: 'kind_of_car_symbol',
        column: 58,
        length: 1,
        formate: 'A',
        wheel_detail: wheel_detail,
        value: null
    };
    let load_empty_indicator = {
        name: 'load_empty_indicator',
        column: 59,
        length: 1,
        formate: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };

    let repair_date = {
        name: 'repair_date',
        column: 60,
        length: 6,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let splc = {name: 'splc', column: 66, length: 6, format: 'N', wheel_detail: wheel_detail, value: null};
    let repairing_party = {
        name: 'repairing_party',
        column: 72,
        length: 4,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let repairing_party_invoice_number = {
        name: 'repairing_party_invoice_number',
        column: 76,
        length: 16,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let repairing_party_document_reference_number = {
        name: 'repairing_party_document_reference_number',
        column: 92,
        length: 15,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let repair_facility_type = {
        name: 'repair_facility_type',
        column: 107,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let location_on_car = {
        name: 'location_on_car',
        column: 109,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let reserved_for_future_crb_use_1 = {
        name: 'reserved_for_future_crb_use_1',
        column: 111,
        length: 1,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let reserved_for_future_crb_use_2 = {
        name: 'reserved_for_future_crb_use_2',
        column: 112,
        length: 1,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let quantity = {name: 'quantity', column: 113, length: 4, format: 'N', wheel_detail: wheel_detail, value: null};
    let condition_code = {
        name: 'condition_code',
        column: 117,
        length: 1,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let reserved_for_future_crb_use_3 = {
        name: 'reserved_for_future_crb_use_3',
        column: 118,
        length: 2,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let applied_job_code = {
        name: 'applied_job_code',
        column: 120,
        length: 4,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let applied_qualifier = {
        name: 'applied_qualifier',
        column: 124,
        length: 3,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let why_made_code = {
        name: 'why_made_code',
        column: 127,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let reserved_for_future_crb_use_4 = {
        name: 'reserved_for_future_crb_use_4',
        column: 129,
        length: 2,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let removed_job_code = {
        name: 'removed_job_code',
        column: 131,
        length: 4,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let removed_qualifier = {
        name: 'removed_qualifier',
        column: 135,
        length: 3,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let responsibility_code = {
        name: 'responsibility_code',
        column: 138,
        length: 1,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let defect_card_jic_party = {
        name: 'defect_card_jic_party',
        column: 139,
        length: 4,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let defect_card_jic_date = {
        name: 'defect_card_jic_date',
        column: 143,
        length: 6,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let labor_charge = {
        name: 'labor_charge',
        column: 149,
        length: 7,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let material_charge = {
        name: 'material_charge',
        column: 156,
        length: 8,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let material_sign = {
        name: 'material_sign',
        column: 164,
        length: 1,
        format: 'A',
        wheel_detail: wheel_detail,
        value: null
    };
    let machine_priceable_indicator = {
        name: 'machine_priceable_indicator',
        column: 165,
        length: 1,
        format: 'A',
        wheel_detail: wheel_detail,
        value: null
    };
    let wrong_repair_indicator = {
        name: 'wrong_repair_indicator',
        column: 166,
        length: 1,
        format: 'A',
        wheel_detail: wheel_detail,
        value: null
    };
    let wheel_narrative = {
        name: 'wheel_narrative',
        column: 167,
        length: 50,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let wheel_narrative_if_wheel_details = {
        name: 'wheel_narrative',
        column: 167,
        length: 28,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };


    let applied_wheel_date = {
        name: 'applied_wheel_date',
        column: 195,
        length: 4,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let applied_wheel_manufacture_code = {
        name: 'applied_wheel_manufacture_code',
        column: 199,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let applied_wheel_class_code = {
        name: 'applied_wheel_class_code',
        column: 201,
        length: 1,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let applied_side_reading = {
        name: 'applied_side_reading',
        column: 202,
        length: 2,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let applied_finger_reading = {
        name: 'applied_finger_reading',
        column: 204,
        length: 2,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let removed_wheel_date = {
        name: 'removed_wheel_date',
        column: 206,
        length: 4,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let removed_wheel_manufacture_code = {
        name: 'removed_wheel_manufacture_code',
        column: 210,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let removed_wheel_class_code = {
        name: 'removed_wheel_class_code',
        column: 212,
        length: 1,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let removed_side_reading = {
        name: 'removed_side_reading',
        column: 213,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let removed_finger_reading = {
        name: 'removed_finger_reading',
        column: 215,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };



    let labor_rate = {name: 'labor_rate', column: 217, length: 5, format: 'N', wheel_detail: wheel_detail, value: null};
    let expanded_splc = {
        name: 'expanded_splc',
        column: 222,
        length: 9,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let cif_repairing_party = {
        name: 'cif_repairing_party',
        column: 231,
        length: 13,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let cif_billing_invoicing_party = {
        name: 'cif_billing_invoicing_party',
        column: 244,
        length: 13,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let cif_billed_party = {
        name: 'cif_billed_party',
        column: 257,
        length: 13,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let cif_defect_jic_party = {
        name: 'cif_defect_jic_party',
        column: 270,
        length: 13,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let repair_facility_arrival_date = {
        name: 'repair_facility_arrival_date',
        column: 283,
        length: 6,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let line_number = {
        name: 'line_number',
        column: 289,
        length: 5,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let railinc_inbound_date_stamp = {
        name: 'railinc_inbound_date_stamp',
        column: 294,
        length: 6,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let railinc_outbound_date_stamp = {
        name: 'railinc_outbound_date_stamp',
        column: 300,
        length: 6,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let resubmitted_invoice_indicator = {
        name: 'resubmitted_invoice_indicator',
        column: 306,
        length: 1,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let original_invoice_number = {
        name: 'original_invoice_number',
        column: 307,
        length: 16,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let original_account_date = {
        name: 'original_account_date',
        column: 323,
        length: 4,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let aar_component_id = {
        name: 'aar_component_id',
        column: 327,
        length: 14,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let ddct_incident_id = {
        name: 'ddct_incident_id',
        column: 341,
        length: 14,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let reserved_for_future_crb_use_5 = {
        name: 'reserved_for_future_crb_use_5',
        column: 353,
        length: 48,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let free_user_area = {
        name: 'free_user_area',
        column: 401,
        length: 100,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };

    let total_record_count = {
        name: 'total_record_count',
        column: 33,
        length: 7,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let total_labor_charge = {
        name: 'total_labor_charge',
        column: 40,
        length: 10,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let total_material_charge = {
        name: 'total_material_charge',
        column: 50,
        length: 16,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let total_sign = {name: 'total_sign', column: 66, length: 1, format: 'A', wheel_detail: wheel_detail, value: null};
    let invoice_date = {
        name: 'invoice_date',
        column: 67,
        length: 6,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let taxpayer_id = {
        name: 'taxpayer_id',
        column: 73,
        length: 15,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let payment_term = {
        name: 'payment_term',
        column: 88,
        length: 2,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let payment_due_date = {
        name: 'payment_due_date',
        column: 90,
        length: 6,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let railinc_inbound_date = {
        name: 'railinc_inbound_date',
        column: 96,
        length: 6,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };
    let railinc_outbound_date = {
        name: 'railinc_outbound_date',
        column: 102,
        length: 6,
        format: 'N',
        wheel_detail: wheel_detail,
        value: null
    };

    let rt_contact_type = {
        name: 'rt_contact_type',
        column: 31,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let rt_company_name = {
        name: 'rt_company_name',
        column: 33,
        length: 50,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let rt_name = {name: 'rt_name', column: 83, length: 35, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let rt_title = {name: 'rt_title', column: 118, length: 35, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let rt_phone = {name: 'rt_phone', column: 153, length: 25, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let rt_fax = {name: 'rt_fax', column: 178, length: 25, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let rt_email = {name: 'rt_email', column: 203, length: 60, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let rt_address1 = {
        name: 'rt_address1',
        column: 263,
        length: 45,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let rt_address2 = {
        name: 'rt_address2',
        column: 308,
        length: 45,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let rt_address3 = {
        name: 'rt_address3',
        column: 353,
        length: 45,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let rt_address4 = {
        name: 'rt_address4',
        column: 398,
        length: 45,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let rt_city = {name: 'rt_city', column: 443, length: 35, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let rt_state = {name: 'rt_state', column: 478, length: 2, format: 'A', wheel_detail: wheel_detail, value: null};
    let rt_country_code = {
        name: 'rt_country_code',
        column: 480,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let rt_zip_code = {
        name: 'rt_zip_code',
        column: 482,
        length: 10,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };

    let bp_contact_type = {
        name: 'bp_contact_type',
        column: 31,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let bp_company_name = {
        name: 'bp_company_name',
        column: 33,
        length: 50,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let bp_name = {name: 'bp_name', column: 83, length: 35, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let bp_title = {name: 'bp_title', column: 118, length: 35, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let bp_phone = {name: 'bp_phone', column: 153, length: 25, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let bp_fax = {name: 'bp_fax', column: 178, length: 25, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let bp_email = {name: 'bp_email', column: 203, length: 60, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let bp_address1 = {
        name: 'bp_address1',
        column: 263,
        length: 45,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let bp_address2 = {
        name: 'bp_address2',
        column: 308,
        length: 45,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let bp_address3 = {
        name: 'bp_address3',
        column: 353,
        length: 45,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let bp_address4 = {
        name: 'bp_address4',
        column: 398,
        length: 45,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let bp_city = {name: 'bp_city', column: 443, length: 35, format: 'A/N', wheel_detail: wheel_detail, value: null};
    let bp_state = {name: 'bp_state', column: 478, length: 2, format: 'A', wheel_detail: wheel_detail, value: null};
    let bp_country_code = {
        name: 'bp_country_code',
        column: 480,
        length: 2,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };
    let bp_zip_code = {
        name: 'bp_zip_code',
        column: 482,
        length: 10,
        format: 'A/N',
        wheel_detail: wheel_detail,
        value: null
    };

    var my_new_order = item;
    var filename = "BIRCH " + my_new_order.railcar_id + ".txt";

    const owner = my_new_order.railcar.owner_railcar_owner_idToowner;
    const lessee = my_new_order.railcar.owner_railcar_lessee_idToowner;


    var owner_address = {
        "id": forWhom == 1 || forWhom == 2 ? owner.id : lessee.id,
        "name": forWhom == 1 || forWhom == 2 ? owner.name : lessee.name,
        "labor_rate": forWhom == 1 || forWhom == 2 ? owner.labor_rate : lessee.labor_rate,
        "markup_percent": forWhom == 1 || forWhom == 2 ? owner.markup_percent : lessee.markup_percent,
        "abbreviation": forWhom == 1 || forWhom == 2 ? owner.abbreviation : lessee.abbreviation,
        "billing_address": forWhom == 1 || forWhom == 2 ? owner.billing_address : lessee.billing_address,
        "address_line1": forWhom == 1 || forWhom == 2 ? owner.address_line1 : lessee.address_line1,
        "address_line2": forWhom == 1 || forWhom == 2 ? owner.address_line2 : lessee.address_line2,
        "city": forWhom == 1 || forWhom == 2 ? owner.city : lessee.city,
        "state": forWhom == 1 || forWhom == 2 ? owner.state : lessee.state,
        "country": forWhom == 1 || forWhom == 2 ? owner.country : lessee.country,
        "zip_code": forWhom == 1 || forWhom == 2 ? owner.zip_code : lessee.zip_code,
        "contact_name": forWhom == 1 || forWhom == 2 ? owner.contact_name : lessee.contact_name,
        "contact_number": forWhom == 1 || forWhom == 2 ? owner.contact_number : lessee.contact_number,
        "contact_email": forWhom == 1 || forWhom == 2 ? owner.contact_email : lessee.contact_email,
        "is_po": forWhom == 1 || forWhom == 2 ? owner.is_po : lessee.is_po,
        "is_active": forWhom == 1 || forWhom == 2 ? owner.is_active : lessee.is_active
    }

    // ====================================================================================
    // setting required values
    // ====================================================================================

    var _price_master_file_indicator = "U";
    var _repairing_party_invoice_number = null;
    var _material_sign = "D"; //D
    var _total_sign = "D";    //D
    var _machine_priceable_indicator = "Y";
    var _taxpayer_id = null;

    let workorder = my_new_order
    data = workorder;
    billing_invoicing_party.value = getObjComputedValue(billing_invoicing_party, workorder.yard.abbreviation);

    billed_party.value = getObjComputedValue(billed_party, owner_address.abbreviation);
    detail_source.value = getObjComputedValue(detail_source, workorder.yard.detail_source);

    car_initial.value = getObjComputedValue(car_initial, workorder.railcar_id.slice(0, 4));
    car_number.value = getObjComputedValue(car_number, workorder.railcar_id.slice(4, 10));
    kind_of_car_symbol.value = getObjComputedValue(kind_of_car_symbol, workorder.railcar.railcartype.short_name);
    load_empty_indicator.value = getObjComputedValue(load_empty_indicator, workorder.el_index);
    repair_date.value = getObjComputedValue(repair_date, new Date(workorder.repair_date));
    if (workorder.repair_date == null) {
        repair_date.value = getObjComputedValue(repair_date, new Date(process.env.REACT_APP_DEFAULT_DATE));
    }
    splc.value = getObjComputedValue(splc, workorder.yard.splc);
    repairing_party.value = getObjComputedValue(repairing_party, workorder.yard.abbreviation);

    repair_facility_type.value = getObjComputedValue(repair_facility_type, workorder.yard.facility_type);

    var total_material_cost = 0.0;
    let number_of_jobs = 0


    let labor_cost = 0;
    let material_cost = 0
    let total_hour = 0;
    let net_cost = 0;
    if (forWhom == 1) {
        workorder.joblist.forEach((myjob, i) => {
            number_of_jobs++;


            // total_hour += (myjob.labor_time * myjob.quantity)
            // labor_cost += myjob.labor_cost
            // material_cost += myjob.material_cost
            // myjob.jobparts.forEach(function (item) {
            //     var single_mat_cost = round2Dec(item.quantity) * (round2Dec(item.purchase_cost) * (1 + round2Dec(item.markup_percent) * 1))
            //     total_material_cost += Number(round2Dec(single_mat_cost))
            // });


            const laborCost = Number(round2Dec(myjob.labor_rate)) * Number(round2Dec(myjob.labor_time)) * Number(round2Dec(myjob.quantity));
            labor_cost += Number(round2Dec(laborCost));

            // Calculate labor hours
            const laborHours = Number(round2Dec(myjob.labor_time)) * myjob.quantity;
            total_hour += Number(round2Dec(laborHours));

            // Calculate material cost
            myjob.jobparts.forEach(part => {
                const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                const single_mat_cost = Number(round2Dec(purchaseCost + markup));
                total_material_cost += Number(round2Dec(single_mat_cost));
            });


        });
        net_cost = Number(round2Dec(labor_cost + material_cost))
    } else if (forWhom == 2) {
        workorder.joblist.forEach((myjob, i) => {
            if (myjob.secondary_bill_to_id == null) {
                number_of_jobs++;
                // total_hour += (myjob.labor_time * myjob.quantity)
                // labor_cost += myjob.labor_cost
                // material_cost += myjob.material_cost
                // myjob.jobparts.forEach(function (item) {
                //     var single_mat_cost = round2Dec(item.quantity) * (round2Dec(item.purchase_cost) * (1 + round2Dec(item.markup_percent) * 1))
                //     total_material_cost += Number(round2Dec(single_mat_cost))
                // });

                const laborCost = Number(round2Dec(myjob.labor_rate)) * Number(round2Dec(myjob.labor_time)) * Number(round2Dec(myjob.quantity));
                labor_cost += Number(round2Dec(laborCost));

                // Calculate labor hours
                const laborHours = Number(round2Dec(myjob.labor_time)) * myjob.quantity;
                total_hour += Number(round2Dec(laborHours));

                // Calculate material cost
                myjob.jobparts.forEach(part => {
                    const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                    const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                    const single_mat_cost = Number(round2Dec(purchaseCost + markup));
                    total_material_cost += Number(round2Dec(single_mat_cost));
                });

            }
        });
        net_cost = Number(round2Dec(labor_cost + material_cost))
    } else {
        workorder.joblist.forEach((myjob, i) => {
            if (myjob.secondary_bill_to_id !== null) {
                number_of_jobs++;
                // total_hour += (myjob.labor_time * myjob.quantity)
                // labor_cost += myjob.labor_cost
                // material_cost += myjob.material_cost
                // myjob.jobparts.forEach(function (item) {
                //     var single_mat_cost = round2Dec(item.quantity) * (round2Dec(item.purchase_cost) * (1 + round2Dec(item.markup_percent) * 1))
                //     total_material_cost += Number(round2Dec(single_mat_cost))
                // });

                const laborCost = Number(round2Dec(myjob.labor_rate)) * Number(round2Dec(myjob.labor_time)) * Number(round2Dec(myjob.quantity));
                labor_cost += Number(round2Dec(laborCost));

                // Calculate labor hours
                const laborHours = Number(round2Dec(myjob.labor_time)) * myjob.quantity;
                total_hour += Number(round2Dec(laborHours));

                // Calculate material cost
                myjob.jobparts.forEach(part => {
                    const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                    const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                    const single_mat_cost = Number(round2Dec(purchaseCost + markup));
                    total_material_cost += Number(round2Dec(single_mat_cost));
                });
            }
        });
        net_cost = Number(round2Dec(labor_cost + material_cost))
    }

    let costs = {
        'labor_cost': round2Dec(labor_cost),
        'material_cost': round2Dec(material_cost),
        'net_cost': round2Dec(net_cost),
        'total_hour': round2Dec(total_hour)
    };


    total_record_count.value = getObjComputedValue(total_record_count, number_of_jobs);
    total_labor_charge.value = getObjComputedValue(total_labor_charge, costs.labor_cost * 100);
    total_material_charge.value = getObjComputedValue(total_material_charge, total_material_cost * 100);
    account_date.value = getObjComputedValue(account_date, forWhom == 1 || forWhom == 2 ? new Date(workorder.invoice_date) : new Date(workorder.secondary_owner_info.invoice_date));
    invoice_number.value = getObjComputedValue(invoice_number, forWhom == 1 || forWhom == 2 ? workorder.invoice_number : workorder.secondary_owner_info.invoice_number);
    invoice_date.value = getObjComputedValue(invoice_date, forWhom == 1 || forWhom == 2 ? new Date(workorder.invoice_date) : new Date(workorder.secondary_owner_info.invoice_date));

    let inv_number = forWhom == 1 || forWhom == 2 ? workorder.invoice_number : workorder.secondary_owner_info.invoice_number
    price_master_file_indicator.value = getObjComputedValue(price_master_file_indicator, _price_master_file_indicator);

    repairing_party_invoice_number.value = getObjComputedValue(repairing_party_invoice_number, _repairing_party_invoice_number == null ? inv_number : _repairing_party_invoice_number);

    machine_priceable_indicator.value = getObjComputedValue(machine_priceable_indicator, _machine_priceable_indicator);
    material_sign.value = getObjComputedValue(material_sign, _material_sign);
    total_sign.value = getObjComputedValue(total_sign, _total_sign);
    taxpayer_id.value = getObjComputedValue(taxpayer_id, _taxpayer_id);

    rt_contact_type.value = getObjComputedValue(rt_contact_type, "RT");
    rt_company_name.value = getObjComputedValue(rt_company_name, workorder.yard.name);
    rt_name.value = getObjComputedValue(rt_name, "Morgan Birdwell")
    rt_title.value = getObjComputedValue(rt_title, "CPA")
    rt_phone.value = getObjComputedValue(rt_phone, "402-681-3995")
    rt_fax.value = getObjComputedValue(rt_fax, "");
    rt_email.value = getObjComputedValue(rt_email, "morgan@ihrail.com");
    rt_address1.value = getObjComputedValue(rt_address1, "PO Box 7406");
    rt_address2.value = getObjComputedValue(rt_address2, "");
    rt_address3.value = getObjComputedValue(rt_address3, "");
    rt_address4.value = getObjComputedValue(rt_address4, "");
    rt_city.value = getObjComputedValue(rt_city, "Beaumont");
    rt_state.value = getObjComputedValue(rt_state, "TX");
    rt_country_code.value = getObjComputedValue(rt_country_code, "US");
    rt_zip_code.value = getObjComputedValue(rt_zip_code, "77726");

    bp_contact_type.value = getObjComputedValue(bp_contact_type, "BP");
    bp_company_name.value = getObjComputedValue(bp_company_name, owner_address.name);
    bp_name.value = getObjComputedValue(bp_name, owner_address.contact_name)
    bp_title.value = getObjComputedValue(bp_title, "")
    bp_phone.value = getObjComputedValue(bp_phone, owner_address.contact_number)
    bp_fax.value = getObjComputedValue(bp_fax, "");
    bp_email.value = getObjComputedValue(bp_email, owner_address.contact_email);
    bp_address1.value = getObjComputedValue(bp_address1, owner_address.address_line1);
    bp_address2.value = getObjComputedValue(bp_address2, owner_address.address_line2);
    bp_address3.value = getObjComputedValue(bp_address3, "");
    bp_address4.value = getObjComputedValue(bp_address4, "");
    bp_city.value = getObjComputedValue(bp_city, owner_address.city);
    bp_state.value = getObjComputedValue(bp_state, owner_address.state);
    bp_country_code.value = getObjComputedValue(bp_country_code, owner_address.country);
    bp_zip_code.value = getObjComputedValue(bp_zip_code, owner_address.zip_code);


    // ====================================================================================
    // Encoding Starts
    // ====================================================================================

    var en_txt = "";
    //record format=1
    record_format.value = getObjComputedValue(record_format, 1);
    record_format.value = getObjComputedValue(record_format);
    billing_invoicing_party.value = getObjComputedValue(billing_invoicing_party);
    billed_party.value = getObjComputedValue(billed_party);
    account_date.value = getObjComputedValue(account_date);
    invoice_number.value = getObjComputedValue(invoice_number);
    price_master_file_indicator.value = getObjComputedValue(price_master_file_indicator);

    detail_source.value = getObjComputedValue(detail_source);
    document_reference_number.value = getObjComputedValue(document_reference_number);
    car_initial.value = getObjComputedValue(car_initial);
    car_number.value = getObjComputedValue(car_number);
    kind_of_car_symbol.value = getObjComputedValue(kind_of_car_symbol);
    load_empty_indicator.value = getObjComputedValue(load_empty_indicator);
    repair_date.value = getObjComputedValue(repair_date);
    splc.value = getObjComputedValue(splc);
    repairing_party.value = getObjComputedValue(repairing_party);
    repairing_party_invoice_number.value = getObjComputedValue(repairing_party_invoice_number);
    repair_facility_type.value = getObjComputedValue(repair_facility_type);
    repairing_party_document_reference_number.value = getObjComputedValue(repairing_party_document_reference_number);


    var invoice_header = record_format.value + billing_invoicing_party.value + billed_party.value + account_date.value + invoice_number.value + price_master_file_indicator.value;
    var repair_header = detail_source.value + document_reference_number.value + car_initial.value + car_number.value + kind_of_car_symbol.value + load_empty_indicator.value + repair_date.value + splc.value + repairing_party.value + repairing_party_invoice_number.value + repairing_party_document_reference_number.value + repair_facility_type.value;

    if (data.joblist != null) {
        data.joblist.forEach((item, i) => {
            //console.log(item)
            location_on_car.value = getObjComputedValue(location_on_car, item.locationcode ? item.locationcode.code : null);
            quantity.value = getObjComputedValue(quantity, item.quantity);
            condition_code.value = getObjComputedValue(condition_code, item.conditioncode ? item.conditioncode.code : null);
            applied_job_code.value = getObjComputedValue(applied_job_code, item.jobcode_joblist_job_code_appliedTojobcode ? item.jobcode_joblist_job_code_appliedTojobcode.code.substring(0, 4) : null);
            applied_qualifier.value = getObjComputedValue(applied_qualifier, item.qualifiercode_joblist_qualifier_applied_idToqualifiercode ? item.qualifiercode_joblist_qualifier_applied_idToqualifiercode.code : null);
            why_made_code.value = getObjComputedValue(why_made_code, item.whymadecode ? item.whymadecode.code : null);
            removed_job_code.value = getObjComputedValue(removed_job_code, item.jobcode_joblist_job_code_removedTojobcode ? item.jobcode_joblist_job_code_removedTojobcode.code.substring(0, 4) : null);
            removed_qualifier.value = getObjComputedValue(removed_qualifier, item.qualifiercode_joblist_qualifier_removed_idToqualifiercode ? item.qualifiercode_joblist_qualifier_removed_idToqualifiercode.code : null);
            responsibility_code.value = getObjComputedValue(responsibility_code, item.responsibilitycode ? item.responsibilitycode.code : null);

            const laborCost = Number(round2Dec(item.labor_rate)) * Number(round2Dec(item.labor_time)) * Number(round2Dec(item.quantity));

            labor_charge.value = getObjComputedValue(labor_charge, Math.abs(laborCost) * 100);

            var mat_cost_single_job = 0
            item.jobparts.forEach(function (part) {
                // var single_mat_cost = round2Dec(part.quantity) * (round2Dec(part.purchase_cost) * (1 + round2Dec(part.markup_percent) * 1))
                // mat_cost_single_job += Number(round2Dec(single_mat_cost))

                const purchaseCost = Number(round2Dec(part.purchase_cost)) * part.quantity;
                const markup = Number(round2Dec(purchaseCost)) * Number(round2Dec(part.markup_percent));
                const single_mat_cost = Number(round2Dec(purchaseCost + markup));
                mat_cost_single_job += Number(round2Dec(single_mat_cost))
            });

            material_charge.value = getObjComputedValue(material_charge, mat_cost_single_job * 100);
            if (parseInt(item.job_code_applied) > 6999) {
                machine_priceable_indicator.value = getObjComputedValue(machine_priceable_indicator, "N");
            } else {
                machine_priceable_indicator.value = getObjComputedValue(machine_priceable_indicator, "Y");
            }
            // if(!item.wheel_details){
            //     wheel_narrative.value = getObjComputedValue(wheel_narrative, item.job_description);
            // }

            wheel_narrative.value =  item.wheel_details?getObjComputedValue(wheel_narrative_if_wheel_details, item.job_description) :getObjComputedValue(wheel_narrative, item.job_description);
            //console.log(wheel_narrative.value.length)
            if(item.wheel_details){
                let offset = 0;


                applied_wheel_date.value = getObjComputedValue(applied_wheel_date,  item.wheel_details.substring(offset,offset +  applied_wheel_date.length));

                offset += applied_wheel_date.length;

                applied_wheel_manufacture_code.value = getObjComputedValue(applied_wheel_manufacture_code, item.wheel_details.substring(offset,offset +  applied_wheel_manufacture_code.length));
                offset += applied_wheel_manufacture_code.length;

                applied_wheel_class_code.value = getObjComputedValue(applied_wheel_class_code, item.wheel_details.substring(offset, offset + applied_wheel_class_code.length));
                offset += applied_wheel_class_code.length;

                applied_side_reading.value = getObjComputedValue(applied_side_reading, item.wheel_details.substring(offset,offset +  applied_side_reading.length));
                offset += applied_side_reading.length;

                applied_finger_reading.value = getObjComputedValue(applied_finger_reading, item.wheel_details.substring(offset,offset +  applied_finger_reading.length));
                offset += applied_finger_reading.length;

                removed_wheel_date.value = getObjComputedValue(removed_wheel_date, item.wheel_details.substring(offset,offset +  removed_wheel_date.length));
                offset += removed_wheel_date.length;

                removed_wheel_manufacture_code.value = getObjComputedValue(removed_wheel_manufacture_code, item.wheel_details.substring(offset, offset + removed_wheel_manufacture_code.length));
                offset += removed_wheel_manufacture_code.length;

                removed_wheel_class_code.value = getObjComputedValue(removed_wheel_class_code, item.wheel_details.substring(offset, offset + removed_wheel_class_code.length));
                offset += removed_wheel_class_code.length;

                removed_side_reading.value = getObjComputedValue(removed_side_reading, item.wheel_details.substring(offset,offset +  removed_side_reading.length));
                offset += removed_side_reading.length;

                removed_finger_reading.value = getObjComputedValue(removed_finger_reading, item.wheel_details.substring(offset,offset +  removed_finger_reading.length));
                offset += removed_finger_reading.length;

            }




            labor_rate.value = getObjComputedValue(labor_rate, item.labor_rate * 100);
            line_number.value = getObjComputedValue(line_number, item.line_number);
            var mat_sign;
            if (item.labor_rate >= 0) {
                mat_sign = "D"
            } else {
                mat_sign = "C"
            }


            location_on_car.value = getObjComputedValue(location_on_car);
            reserved_for_future_crb_use_1.value = getObjComputedValue(reserved_for_future_crb_use_1);
            reserved_for_future_crb_use_2.value = getObjComputedValue(reserved_for_future_crb_use_2);
            quantity.value = getObjComputedValue(quantity);
            condition_code.value = getObjComputedValue(condition_code);
            reserved_for_future_crb_use_3.value = getObjComputedValue(reserved_for_future_crb_use_3);
            applied_job_code.value = getObjComputedValue(applied_job_code);
            applied_qualifier.value = getObjComputedValue(applied_qualifier);
            why_made_code.value = getObjComputedValue(why_made_code);
            reserved_for_future_crb_use_4.value = getObjComputedValue(reserved_for_future_crb_use_4);
            removed_job_code.value = getObjComputedValue(removed_job_code);
            removed_qualifier.value = getObjComputedValue(removed_qualifier);
            responsibility_code.value = getObjComputedValue(responsibility_code);
            defect_card_jic_party.value = getObjComputedValue(defect_card_jic_party);
            defect_card_jic_date.value = getObjComputedValue(defect_card_jic_date);
            labor_charge.value = getObjComputedValue(labor_charge);
            material_charge.value = getObjComputedValue(material_charge);
            machine_priceable_indicator.value = getObjComputedValue(machine_priceable_indicator);
            wrong_repair_indicator.value = getObjComputedValue(wrong_repair_indicator);


            var repair_detail = location_on_car.value
                + reserved_for_future_crb_use_1.value
                + reserved_for_future_crb_use_2.value
                + quantity.value
                + condition_code.value
                + reserved_for_future_crb_use_3.value
                + applied_job_code.value
                + applied_qualifier.value
                + why_made_code.value
                + reserved_for_future_crb_use_4.value
                + removed_job_code.value
                + removed_qualifier.value
                + responsibility_code.value
                + defect_card_jic_party.value
                + defect_card_jic_date.value
                + labor_charge.value
                + material_charge.value
                + mat_sign
                + machine_priceable_indicator.value
                + wrong_repair_indicator.value;

            //console.log(machine_priceable_indicator.value)


            wheel_narrative.value =  item.wheel_details?  getObjComputedValue(wheel_narrative_if_wheel_details):getObjComputedValue(wheel_narrative);
            applied_wheel_date.value = getObjComputedValue(applied_wheel_date);
            applied_wheel_manufacture_code.value = getObjComputedValue(applied_wheel_manufacture_code);
            applied_wheel_class_code.value = getObjComputedValue(applied_wheel_class_code);
            applied_side_reading.value = getObjComputedValue(applied_side_reading);
            applied_finger_reading.value = getObjComputedValue(applied_finger_reading);
            removed_wheel_date.value = getObjComputedValue(removed_wheel_date);
            removed_wheel_manufacture_code.value = getObjComputedValue(removed_wheel_manufacture_code);
            removed_wheel_class_code.value = getObjComputedValue(removed_wheel_class_code);
            removed_side_reading.value = getObjComputedValue(removed_side_reading);
            removed_finger_reading.value = getObjComputedValue(removed_finger_reading);
            labor_rate.value = getObjComputedValue(labor_rate);
            expanded_splc.value = getObjComputedValue(expanded_splc);
            cif_repairing_party.value = getObjComputedValue(cif_repairing_party);
            cif_billing_invoicing_party.value = getObjComputedValue(cif_billing_invoicing_party);
            cif_billed_party.value = getObjComputedValue(cif_billed_party);
            cif_defect_jic_party.value = getObjComputedValue(cif_defect_jic_party);
            repair_facility_arrival_date.value = getObjComputedValue(repair_facility_arrival_date);
            line_number.value = getObjComputedValue(line_number);
            railinc_inbound_date_stamp.value = getObjComputedValue(railinc_inbound_date_stamp);
            railinc_outbound_date_stamp.value = getObjComputedValue(railinc_outbound_date_stamp);
            resubmitted_invoice_indicator.value = getObjComputedValue(resubmitted_invoice_indicator);
            original_invoice_number.value = getObjComputedValue(original_invoice_number);
            original_account_date.value = getObjComputedValue(original_account_date);

            aar_component_id.value =item.cid? getObjComputedValue(aar_component_id,item.cid):"";
            ddct_incident_id.value = getObjComputedValue(ddct_incident_id);
            reserved_for_future_crb_use_5.value = getObjComputedValue(reserved_for_future_crb_use_5);


            var narrative_detail = wheel_narrative.value;
            //console.log(wheel_narrative.value)
            if (item.wheel_details) {
                narrative_detail += applied_wheel_date.value + applied_wheel_manufacture_code.value + applied_wheel_class_code.value + applied_side_reading.value + applied_finger_reading.value + removed_wheel_date.value + removed_wheel_manufacture_code.value + removed_wheel_class_code.value + removed_side_reading.value + removed_finger_reading.value;
            }

            var other_detail = labor_rate.value + expanded_splc.value + cif_repairing_party.value + cif_billing_invoicing_party.value + cif_billed_party.value + cif_defect_jic_party.value + repair_facility_arrival_date.value + line_number.value + railinc_inbound_date_stamp.value + railinc_outbound_date_stamp.value + resubmitted_invoice_indicator.value + original_invoice_number.value + original_account_date.value + aar_component_id.value + ddct_incident_id.value + reserved_for_future_crb_use_5.value;

            if (forWhom == 1) {

                en_txt += padStringTo500(invoice_header + repair_header + repair_detail + narrative_detail + other_detail) + "\n";
                //console.log(en_txt)
            }
            if (forWhom == 2) {
                if (item.secondary_bill_to_id == null) {
                    en_txt += padStringTo500(invoice_header + repair_header + repair_detail + narrative_detail + other_detail) + "\n";
                    //console.log(en_txt)
                }
            }
            if (forWhom == 3) {
                if (item.secondary_bill_to_id !== null) {
                    en_txt += padStringTo500(invoice_header + repair_header + repair_detail + narrative_detail + other_detail) + "\n";
                    //console.log(en_txt)
                }
            }

            other_detail=''

        });

    }
    //record format=8
    record_format.value = getObjComputedValue(record_format, 8);
    record_format.value = getObjComputedValue(record_format);
    billing_invoicing_party.value = getObjComputedValue(billing_invoicing_party);
    billed_party.value = getObjComputedValue(billed_party);
    account_date.value = getObjComputedValue(account_date);
    invoice_number.value = getObjComputedValue(invoice_number);
    price_master_file_indicator.value = getObjComputedValue(price_master_file_indicator);

    var invoice_header = record_format.value + billing_invoicing_party.value + billed_party.value + account_date.value + invoice_number.value + price_master_file_indicator.value;


    total_record_count.value = getObjComputedValue(total_record_count);
    total_labor_charge.value = getObjComputedValue(total_labor_charge);
    total_material_charge.value = getObjComputedValue(total_material_charge);
    total_sign.value = getObjComputedValue(total_sign);
    invoice_date.value = getObjComputedValue(invoice_date);
    taxpayer_id.value = getObjComputedValue(taxpayer_id);
    payment_term.value = getObjComputedValue(payment_term);
    payment_due_date.value = getObjComputedValue(payment_due_date);
    railinc_inbound_date.value = getObjComputedValue(railinc_inbound_date);
    railinc_outbound_date.value = getObjComputedValue(railinc_outbound_date);

    var totals_header = total_record_count.value +
        total_labor_charge.value + total_material_charge.value +
        total_sign.value + invoice_date.value +
        taxpayer_id.value + payment_term.value +
        payment_due_date.value + railinc_inbound_date.value +
        railinc_outbound_date.value;

    detail_source.value = getObjComputedValue(detail_source);


    en_txt += padStringTo500(invoice_header + detail_source.value + totals_header) + "\n";

    //record format=6

    record_format.value = getObjComputedValue(record_format, 6);
    record_format.value = getObjComputedValue(record_format);
    billing_invoicing_party.value = getObjComputedValue(billing_invoicing_party);
    billed_party.value = getObjComputedValue(billed_party);
    account_date.value = getObjComputedValue(account_date);
    invoice_number.value = getObjComputedValue(invoice_number);
    price_master_file_indicator.value = getObjComputedValue(price_master_file_indicator);


    var invoice_header = record_format.value +
        billing_invoicing_party.value +
        billed_party.value +
        account_date.value +
        invoice_number.value +
        price_master_file_indicator.value;

    rt_contact_type.value = getObjComputedValue(rt_contact_type);
    rt_company_name.value = getObjComputedValue(rt_company_name);
    rt_name.value = getObjComputedValue(rt_name);
    rt_title.value = getObjComputedValue(rt_title);
    rt_phone.value = getObjComputedValue(rt_phone);
    rt_fax.value = getObjComputedValue(rt_fax);
    rt_email.value = getObjComputedValue(rt_email);
    rt_address1.value = getObjComputedValue(rt_address1);
    rt_address2.value = getObjComputedValue(rt_address2);
    rt_address3.value = getObjComputedValue(rt_address3);
    rt_address4.value = getObjComputedValue(rt_address4);
    rt_city.value = getObjComputedValue(rt_city);
    rt_state.value = getObjComputedValue(rt_state);
    rt_country_code.value = getObjComputedValue(rt_country_code);
    rt_zip_code.value = getObjComputedValue(rt_zip_code);

    var contact_type = rt_contact_type.value
    var contact_header = rt_company_name.value +
        rt_name.value +
        rt_title.value +
        rt_phone.value +
        rt_fax.value +
        rt_email.value +
        rt_address1.value +
        rt_address2.value +
        rt_address3.value +
        rt_address4.value +
        rt_city.value +
        rt_state.value +
        rt_country_code.value +
        rt_zip_code.value;
    en_txt += padStringTo500(invoice_header + contact_type + contact_header) + "\n";
    //
    contact_type = "IQ";
    en_txt += padStringTo500(invoice_header + contact_type + contact_header) + "\n";
    contact_type = "EX";
    en_txt += padStringTo500(invoice_header + contact_type + contact_header) + "\n";
    contact_type = "IP";
    en_txt += padStringTo500(invoice_header + contact_type + contact_header) + "\n";

    //BP

    record_format.value = getObjComputedValue(record_format, 6);
    record_format.value = getObjComputedValue(record_format);
    billing_invoicing_party.value = getObjComputedValue(billing_invoicing_party);
    billed_party.value = getObjComputedValue(billed_party);
    account_date.value = getObjComputedValue(account_date);
    invoice_number.value = getObjComputedValue(invoice_number);
    price_master_file_indicator.value = getObjComputedValue(price_master_file_indicator);

    var invoice_header = record_format.value +
        billing_invoicing_party.value +
        billed_party.value +
        account_date.value +
        invoice_number.value +
        price_master_file_indicator.value;

    bp_contact_type.value = getObjComputedValue(bp_contact_type);
    bp_company_name.value = getObjComputedValue(bp_company_name);
    bp_name.value = getObjComputedValue(bp_name);
    bp_title.value = getObjComputedValue(bp_title);
    bp_phone.value = getObjComputedValue(bp_phone);
    bp_fax.value = getObjComputedValue(bp_fax);
    bp_email.value = getObjComputedValue(bp_email);
    bp_address1.value = getObjComputedValue(bp_address1);
    bp_address2.value = getObjComputedValue(bp_address2);
    bp_address3.value = getObjComputedValue(bp_address3);
    bp_address4.value = getObjComputedValue(bp_address4);
    bp_city.value = getObjComputedValue(bp_city);
    bp_state.value = getObjComputedValue(bp_state);
    bp_country_code.value = getObjComputedValue(bp_country_code);
    bp_zip_code.value = getObjComputedValue(bp_zip_code);

    var contact_header = bp_contact_type.value +
        bp_company_name.value +
        bp_name.value +
        bp_title.value +
        bp_phone.value +
        bp_fax.value +
        bp_email.value +
        bp_address1.value +
        bp_address2.value +
        bp_address3.value +
        bp_address4.value +
        bp_city.value +
        bp_state.value +
        bp_country_code.value +
        bp_zip_code.value;
    en_txt += padStringTo500(invoice_header + contact_header) + "\n";


    //record format=8 ZZ
    record_format.value = getObjComputedValue(record_format, 8);
    record_format.value = getObjComputedValue(record_format);
    billing_invoicing_party.value = getObjComputedValue(billing_invoicing_party);
    billed_party.value = getObjComputedValue(billed_party);
    account_date.value = getObjComputedValue(account_date);
    invoice_number.value = getObjComputedValue(invoice_number);
    price_master_file_indicator.value = getObjComputedValue(price_master_file_indicator);

    var invoice_header = record_format.value + billing_invoicing_party.value + billed_party.value + account_date.value + invoice_number.value + price_master_file_indicator.value;

    total_record_count.value = getObjComputedValue(total_record_count);
    total_labor_charge.value = getObjComputedValue(total_labor_charge);
    total_material_charge.value = getObjComputedValue(total_material_charge);
    total_sign.value = getObjComputedValue(total_sign);
    invoice_date.value = getObjComputedValue(invoice_date);
    taxpayer_id.value = getObjComputedValue(taxpayer_id);
    payment_term.value = getObjComputedValue(payment_term);
    payment_due_date.value = getObjComputedValue(payment_due_date);
    railinc_inbound_date.value = getObjComputedValue(railinc_inbound_date);
    railinc_outbound_date.value = getObjComputedValue(railinc_outbound_date);

    var totals_header = total_record_count.value +
        total_labor_charge.value + total_material_charge.value +
        total_sign.value + invoice_date.value +
        taxpayer_id.value + payment_term.value +
        payment_due_date.value + railinc_inbound_date.value +
        railinc_outbound_date.value;

    en_txt += padStringTo500(invoice_header + "ZZ" + totals_header) + "\n";

    //record format =9

    record_format.value = getObjComputedValue(record_format, 9);
    record_format.value = getObjComputedValue(record_format);
    billing_invoicing_party.value = getObjComputedValue(billing_invoicing_party);
    billed_party.value = getObjComputedValue(billed_party);
    account_date.value = getObjComputedValue(account_date);

    var invoice_header = record_format.value + billing_invoicing_party.value + billed_party.value + account_date.value;

    total_record_count.value = getObjComputedValue(total_record_count);
    total_labor_charge.value = getObjComputedValue(total_labor_charge);
    total_material_charge.value = getObjComputedValue(total_material_charge);
    total_sign.value = getObjComputedValue(total_sign);
    invoice_date.value = getObjComputedValue(invoice_date);

    var totals_header = total_record_count.value +
        total_labor_charge.value + total_material_charge.value +
        total_sign.value + invoice_date.value;
    en_txt += padStringTo500(invoice_header + "Z".repeat(19) + totals_header) + "\n";

    var textFileAsBlob = new Blob([en_txt], {type: 'text/plain'});
    //console.log(textFileAsBlob)
    var fileNameToSaveAs = filename; //filename.extension

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
        // Chrome allows the link to be clicked without actually adding it to the DOM.
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    // else {
    //     // Firefox requires the link to be added to the DOM before it can be clicked.
    //     downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    //     downloadLink.onclick = destroyClickedElement;
    //     downloadLink.style.display = "none";
    //     document.body.appendChild(downloadLink);
    // }
    downloadLink.click();

    // ====================================================================================
    // this function is currently not being used
    // if wanna use this function then don't move this out of its parent function printAAR
    // ====================================================================================

    // function Decode(txt) {
    //     console.log("decode")
    //     var lines = {}
    //     txt.split('\n').forEach((line, i) => {
    //         if (line.length > 0) {
    //             if (!Object.keys(lines).includes(line[0])) {
    //                 lines[line[0]] = [];
    //             }
    //             lines[line[0]].push(line);
    //         }
    //     });
    //     if (lines['1']) {
    //         billing_invoicing_party = getDecodedValue(billing_invoicing_party, lines['1'][0]);
    //         billed_party = getDecodedValue(billed_party, lines['1'][0]);
    //         account_date = getDecodedValue(account_date, lines['1'][0]);
    //         invoice_number = getDecodedValue(invoice_number, lines['1'][0]);
    //         price_master_file_indicator = getDecodedValue(price_master_file_indicator, lines['1'][0]);
    //         detail_source = getDecodedValue(detail_source, lines['1'][0]);
    //         document_reference_number = getDecodedValue(document_reference_number, lines['1'][0]);
    //         car_initial = getDecodedValue(car_initial, lines['1'][0]);
    //         car_number = getDecodedValue(car_number, lines['1'][0]);
    //         kind_of_car_symbol = getDecodedValue(kind_of_car_symbol, lines['1'][0]);
    //         load_empty_indicator = getDecodedValue(load_empty_indicator, lines['1'][0]);

    //         repair_date = getDecodedValue(repair_date, lines['1'][0]);
    //         splc = getDecodedValue(splc, lines['1'][0]);
    //         repairing_party = getDecodedValue(repairing_party, lines['1'][0]);
    //         repairing_party_invoice_number = getDecodedValue(repairing_party_invoice_number, lines['1'][0]);
    //         repairing_party_document_reference_number = getDecodedValue(repairing_party_document_reference_number, lines['1'][0]);
    //         repair_facility_type = getDecodedValue(repair_facility_type, lines['1'][0]);

    //         var jobs = [];

    //         for (var i = 0; i < lines['1'].length; i++) {
    //             var item = {};

    //             location_on_car = getDecodedValue(location_on_car, lines['1'][i]);
    //             quantity = getDecodedValue(quantity, lines['1'][i]);
    //             condition_code = getDecodedValue(condition_code, lines['1'][i]);
    //             applied_job_code = getDecodedValue(applied_job_code, lines['1'][i]);
    //             applied_qualifier = getDecodedValue(applied_qualifier, lines['1'][i]);
    //             why_made_code = getDecodedValue(why_made_code, lines['1'][i]);
    //             removed_job_code = getDecodedValue(removed_job_code, lines['1'][i]);
    //             removed_qualifier = getDecodedValue(removed_qualifier, lines['1'][i]);
    //             responsibility_code = getDecodedValue(responsibility_code, lines['1'][i]);
    //             labor_charge = getDecodedValue(labor_charge, lines['1'][i]) / 100;
    //             material_charge = getDecodedValue(material_charge, lines['1'][i]) / 100;
    //             wheel_narrative = getDecodedValue(wheel_narrative, lines['1'][i]);
    //             labor_rate = getDecodedValue(labor_rate, lines['1'][i]) / 100;
    //             line_number = getDecodedValue(line_number, lines['1'][i]);

    //             item['loc'] = location_on_car.result;
    //             item['qty'] = quantity.result;
    //             item['cc'] = condition_code.result;
    //             item['jc'] = applied_job_code.result;
    //             item['aq'] = applied_qualifier.result;
    //             item['wmc'] = why_made_code.result;
    //             item['jcr'] = removed_job_code.result;
    //             item['rq'] = removed_qualifier.result;
    //             item['rc'] = responsibility_code.result;
    //             item['labor_cost'] = labor_charge.result / 100;
    //             item['material_cost'] = material_charge.result / 100;
    //             item['net_cost'] = item['labor_cost'] + item['material_cost'];
    //             item['des'] = wheel_narrative.result;
    //             item['labor_rate'] = labor_rate.result / 100;
    //             item['ln'] = line_number.result;
    //             jobs.push(item);
    //         }
    //         data = jobs;
    //         expanded_splc = getDecodedValue(expanded_splc, lines['1'][0]);
    //         cif_repairing_party = getDecodedValue(cif_repairing_party, lines['1'][0]);
    //         cif_billing_invoicing_party = getDecodedValue(cif_billing_invoicing_party, lines['1'][0]);
    //         cif_billed_party = getDecodedValue(cif_billed_party, lines['1'][0]);
    //         cif_defect_jic_party = getDecodedValue(cif_defect_jic_party, lines['1'][0]);
    //         repair_facility_arrival_date = getDecodedValue(repair_facility_arrival_date, lines['1'][0]);
    //         railinc_inbound_date_stamp = getDecodedValue(railinc_inbound_date_stamp, lines['1'][0]);
    //         railinc_outbound_date_stamp = getDecodedValue(railinc_outbound_date_stamp, lines['1'][0]);
    //         resubmitted_invoice_indicator = getDecodedValue(resubmitted_invoice_indicator, lines['1'][0]);
    //         original_invoice_number = getDecodedValue(original_invoice_number, lines['1'][0]);
    //         original_account_date = getDecodedValue(original_account_date, lines['1'][0]);
    //         aar_component_id = getDecodedValue(aar_component_id, lines['1'][0]);
    //         ddct_incident_id = getDecodedValue(ddct_incident_id, lines['1'][0]);
    //         reserved_for_future_crb_use_5 = getDecodedValue(reserved_for_future_crb_use_5, lines['1'][0]);
    //         free_user_area = getDecodedValue(free_user_area, lines['1'][0]);
    //     }
    //     if (lines['6']) {
    //         for (var i = 0; i < lines['6'].length; i++) {
    //             rt_contact_type = getDecodedValue(rt_contact_type, lines['6'][i]);
    //             var id = rt_contact_type.result;
    //             if (id == "RT") {
    //                 rt_contact_type = getDecodedValue(rt_contact_type, lines['6'][i]);
    //                 rt_company_name = getDecodedValue(rt_company_name, lines['6'][i]);
    //                 rt_name = getDecodedValue(rt_name, lines['6'][i]);
    //                 rt_title = getDecodedValue(rt_title, lines['6'][i]);
    //                 rt_phone = getDecodedValue(rt_phone, lines['6'][i]);
    //                 rt_fax = getDecodedValue(rt_fax, lines['6'][i]);
    //                 rt_email = getDecodedValue(rt_email, lines['6'][i]);
    //                 rt_address1 = getDecodedValue(rt_address1, lines['6'][i]);
    //                 rt_address2 = getDecodedValue(rt_address2, lines['6'][i]);
    //                 rt_address3 = getDecodedValue(rt_address3, lines['6'][i]);
    //                 rt_address4 = getDecodedValue(rt_address4, lines['6'][i]);
    //                 rt_city = getDecodedValue(rt_city, lines['6'][i]);
    //                 rt_state = getDecodedValue(rt_state, lines['6'][i]);
    //                 rt_country_code = getDecodedValue(rt_country_code, lines['6'][i]);
    //                 rt_zip_code = getDecodedValue(rt_zip_code, lines['6'][i]);
    //             } else {
    //                 bp_contact_type = getDecodedValue(bp_contact_type, lines['6'][i]);
    //                 bp_company_name = getDecodedValue(bp_company_name, lines['6'][i]);
    //                 bp_name = getDecodedValue(bp_name, lines['6'][i]);
    //                 bp_title = getDecodedValue(bp_title, lines['6'][i]);
    //                 bp_phone = getDecodedValue(bp_phone, lines['6'][i]);
    //                 bp_fax = getDecodedValue(bp_fax, lines['6'][i]);
    //                 bp_email = getDecodedValue(bp_email, lines['6'][i]);
    //                 bp_address1 = getDecodedValue(bp_address1, lines['6'][i]);
    //                 bp_address2 = getDecodedValue(bp_address2, lines['6'][i]);
    //                 bp_address3 = getDecodedValue(bp_address3, lines['6'][i]);
    //                 bp_address4 = getDecodedValue(bp_address4, lines['6'][i]);
    //                 bp_city = getDecodedValue(bp_city, lines['6'][i]);
    //                 bp_state = getDecodedValue(bp_state, lines['6'][i]);
    //                 bp_country_code = getDecodedValue(bp_country_code, lines['6'][i]);
    //                 bp_zip_code = getDecodedValue(bp_zip_code, lines['6'][i]);
    //             }
    //         }
    //     }
    //     if (lines['8']) {
    //         total_record_count = getDecodedValue(total_record_count, lines['8'][0]);
    //         total_labor_charge = getDecodedValue(total_labor_charge, lines['8'][0]);
    //         total_material_charge = getDecodedValue(total_material_charge, lines['8'][0]);
    //         total_sign = getDecodedValue(total_sign, lines['8'][0]);
    //         invoice_date = getDecodedValue(invoice_date, lines['8'][0]);
    //         taxpayer_id = getDecodedValue(taxpayer_id, lines['8'][0]);
    //         payment_term = getDecodedValue(payment_term, lines['8'][0]);
    //         payment_due_date = getDecodedValue(payment_due_date, lines['8'][0]);
    //         railinc_inbound_date = getDecodedValue(railinc_inbound_date, lines['8'][0]);
    //         railinc_outbound_date = getDecodedValue(railinc_outbound_date, lines['8'][0]);
    //     }
    //     if (lines['9']) {

    //     }
    //     return lines;
    // }

}

function getObjComputedValue(data, value) {
    const obj = data;
    var v = value;
    if (value == undefined || value == null) {
        v = obj.value;
    }
    if (v instanceof Date) {
        var year = nDigitNumber(v.getFullYear(), 2);
        var month = nDigitNumber((v.getMonth() * 1 + 1), 2);
        var day = nDigitNumber(v.getDate(), 2);
        var v = v.length === 4 ? `${year}${month}` : `${year}${month}${day}`;
    }
    if (obj.format == "N") {
        obj.value = nDigitNumber(v, obj.length);
    } else {
        v = v == null ? " " : v.toString();
        v = v.replace(/[\r\n\t]+/g, " ");
        obj.value = nDigitString(v, obj.length);
    }
    return obj.value;
}

function getObjComputedValueForWheelNarrative(data, value,length) {
    const obj = data;
    var v = value;

    v = v == null ? " " : v.toString();
    v = v.replace(/[\r\n\t]+/g, " ");
    obj.value = nDigitString(v, length);

    return obj.value;
}

function getDecodedValue(data, txt) {
    const obj = data;
    var i = obj.column - 1;
    var j = i + obj.length;
    var result = '';
    if (txt.length >= j) {
        result = txt.substring(i, j);
    }
    if (obj.format == "N") {
        var result = parseInt(result);
        if (!result) {
            result = 0;
        }
        obj.value = nDigitNumber(result, obj.length);
    } else {
        result = result.trim();
        obj.value = nDigitString(result, obj.length);
    }
    return {
        ...obj,
        result,
    };
}

function padStringTo500(input) {
    if (input.length < 500) {
        return input + ' '.repeat(500 - input.length);
    }
    return input;
}


function nDigitNumber(text, n) {
    if (isNaN(parseFloat(text))) {
        return " ".repeat(n);
    } else {
        var z_text = "0".repeat(n) + Math.round(parseFloat(text));
        return z_text.slice(z_text.length - n, z_text.length);
    }
}

function nDigitString(text, n) {
    var z_text = text == null || text == "NA" ? " ".repeat(n) : text + " ".repeat(n);
    return z_text.slice(0, n).toUpperCase();
}