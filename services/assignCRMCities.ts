import { User } from "../models/user.model";

export async function assignCRMCities(user_ids: string[],
    city_ids: string[],
    flag: number) {
    let owners = user_ids

    if (flag == 0) {
        for (let i = 0; i < owners.length; i++) {
            let owner = await User.findById(owners[i]).populate('assigned_crm_cities');
            if (owner) {
                let oldcitiesids = owner.assigned_crm_cities.map((item) => { return item._id.valueOf() });
                oldcitiesids = oldcitiesids.filter((item) => { return !city_ids.includes(item) });

                await User.findByIdAndUpdate(owner._id, {
                    assigned_crm_cities: oldcitiesids
                })
            }
        }
    }
    else {
        for (let k = 0; k < owners.length; k++) {

            let owner = await User.findById(owners[k]).populate('assigned_crm_cities');
            if (owner) {
                let oldcitiesids = owner.assigned_crm_cities.map((item) => { return item._id.valueOf() });
                for (let i = 0; i < city_ids.length; i++) {
                    if (!oldcitiesids.includes(city_ids[i]))
                        oldcitiesids.push(city_ids[i]);
                }

                await User.findByIdAndUpdate(owner._id, {
                    assigned_crm_cities: oldcitiesids
                })
            }
        }
    }
}