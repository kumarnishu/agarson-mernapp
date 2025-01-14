import xlsx from "xlsx"
import { NextFunction, Request, Response } from 'express';
import isMongoId from "validator/lib/isMongoId";
import { ICRMCity, ICRMState, IKey, IKeyCategory } from "../interfaces/AuthorizationInterface";
import { CRMCity, CRMState, Key, KeyCategory } from "../models/AuthorizationModel";
import Lead, { ReferredParty } from "../models/CrmModel";
import { User } from "../models/UserModel";
import { assignCRMCities } from "../services/assignCRMCities";
import ConvertJsonToExcel from "../services/ConvertJsonToExcel";
import { convertDateToExcelFormat } from "../utils/datesHelper";
import { CreateOrEditCrmCity, CreateCityFromExcelDto, CreateKeyFromExcelDto } from "../dtos/request/AuthorizationDto";
import { GetCrmCityDto, GetCrmStateDto, GetKeyCategoryDto, GetKeyDto } from "../dtos/response/AuthorizationDto";
import { DropDownDto,   } from "../dtos/response/DropDownDto";

export class AuthorizationController {
     
    public async AssignCRMCitiesToUsers(req: Request, res: Response, next: NextFunction) {
        const { city_ids, user_ids, flag } = req.body as { city_ids: string[], user_ids: string[], flag: number }

        if (city_ids && city_ids.length === 0)
            return res.status(400).json({ message: "please select one city " })
        if (user_ids && user_ids.length === 0)
            return res.status(400).json({ message: "please select one city owner" })
        await assignCRMCities(user_ids, city_ids, flag);
        return res.status(200).json({ message: "successfull" })
    }

    public async GetAllCRMCities(req: Request, res: Response, next: NextFunction) {
        try {
            const state = req.query.state;
            const cities = state && state !== 'all' 
                ? await CRMCity.find({ state }).sort('city') 
                : await CRMCity.find().sort('city');
    
            const result = await Promise.all(
                cities.map(async (city) => {
                    const users = await User.find({ assigned_crm_cities: city._id });
                    const assignedUsers = users.map(user => user.username).join(", ");
    
                    return {
                        _id: city._id,
                        city: city.city,
                        alias1: city.alias1,
                        alias2: city.alias2,
                        state: city.state,
                        assigned_users: assignedUsers,
                    };
                })
            );
    
            return res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }
    
    public async GetAllCRMCitiesForDropDown(req: Request, res: Response, next: NextFunction) {
        let result: DropDownDto[] = []
        let state = req.query.state;
        let cities: ICRMCity[] = []
        if (state && state !== 'all')
            cities = await CRMCity.find({ state: state }).sort('city')
        else
            cities = await CRMCity.find().sort('city')
        result = cities.map((c) => {
            return {
                id: c._id, label: c.city, value: c.city
            }
        })
        return res.status(200).json(result)
    }

    public async CreateCRMCity(req: Request, res: Response, next: NextFunction) {
        const { state, city, alias1, alias2 } = req.body as CreateOrEditCrmCity
        if (!state || !city) {
            return res.status(400).json({ message: "please provide required fields" })
        }
        let STate = await CRMState.findOne({ state: state })
        if (!STate) {
            return res.status(400).json({ message: "state not exits" })
        }
        if (await CRMCity.findOne({ city: city.toLowerCase(), state: state }))
            return res.status(400).json({ message: "already exists this city" })
        let result = await new CRMCity({
            state: state,
            alias1,
            alias2,
            city: city,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        let users = await User.find({ assigned_crm_states: STate });
        await assignCRMCities(users.map((i) => { return i._id.valueOf() }), [result._id.valueOf()], 1);
        return res.status(201).json(result)

    }

    public async UpdateCRMCity(req: Request, res: Response, next: NextFunction) {
        const { state, city, alias1, alias2 } = req.body as CreateOrEditCrmCity
        if (!state || !city) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (!await CRMState.findOne({ state: state })) {
            return res.status(400).json({ message: "state not exits" })
        }
        const id = req.params.id
        let oldcity = await CRMCity.findById(id)
        if (!oldcity)
            return res.status(404).json({ message: "city not found" })
        if (city !== oldcity.city)
            if (await CRMCity.findOne({ city: city.toLowerCase(), state: state }))
                return res.status(400).json({ message: "already exists this city" })
        let prevcity = oldcity.city
        oldcity.city = city
        oldcity.alias1 = alias1
        oldcity.alias2 = alias2
        oldcity.state = state
        oldcity.updated_at = new Date()
        if (req.user)
            oldcity.updated_by = req.user
        await oldcity.save()
        await Lead.updateMany({ city: prevcity }, { city: city })
        await ReferredParty.updateMany({ city: prevcity }, { city: city })
        return res.status(200).json(oldcity)

    }
    public async DeleteCRMCity(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "city id not valid" })
        let city = await CRMCity.findById(id);
        if (!city) {
            return res.status(404).json({ message: "city not found" })
        }

        let STate = await CRMState.findOne({ state: city.state });
        if (STate) {
            let users = await User.find({ assigned_crm_states: STate });
            await assignCRMCities(users.map((i) => { return i._id.valueOf() }), [city._id.valueOf()], 1);
        }
        await city.remove();
        return res.status(200).json({ message: "city deleted successfully" })
    }
    public async BulkCreateAndUpdateCRMCityFromExcel(req: Request, res: Response, next: NextFunction) {
        let state = req.params.state
        let result: CreateCityFromExcelDto[] = []
        let statusText: string = ""
        if (!req.file)
            return res.status(400).json({
                message: "please provide an Excel file",
            });
        if (state && req.file) {
            const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
            if (req.file.size > 100 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
            const workbook = xlsx.read(req.file.buffer);
            let workbook_sheet = workbook.SheetNames;
            let workbook_response: CreateCityFromExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (!state || !await CRMState.findOne({ state: state }))
                return res.status(400).json({ message: "provide a state first" })
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }

            for (let i = 0; i < workbook_response.length; i++) {
                let item = workbook_response[i]
                let city: string | null = String(item.city)


                if (city) {
                    if (item._id && isMongoId(String(item._id))) {
                        let oldcity = await CRMCity.findById(item._id)
                        if (oldcity) {
                            if (city !== oldcity.city)
                                if (!await CRMCity.findOne({ city: city.toLowerCase(), state: state })) {
                                    oldcity.city = city
                                    oldcity.state = state
                                    oldcity.updated_at = new Date()
                                    if (req.user)
                                        oldcity.updated_by = req.user
                                    await oldcity.save()
                                    statusText = "updated"

                                }
                        }
                    }

                    if (!item._id || !isMongoId(String(item._id))) {
                        let oldcity = await CRMCity.findOne({ city: city.toLowerCase(), state: state })
                        if (!oldcity) {
                            await new CRMCity({
                                city: city,
                                state: state,
                                created_by: req.user,
                                updated_by: req.user,
                                created_at: new Date(),
                                updated_at: new Date()
                            }).save()
                            statusText = "created"
                        }
                        else
                            statusText = "duplicate"
                    }

                }
                else
                    statusText = "required city"

                result.push({
                    ...item,
                    status: statusText
                })
            }


        }
        return res.status(200).json(result);
    }

    public async FindUnknownCrmCities(req: Request, res: Response, next: NextFunction) {
        let cities = await CRMCity.find({ city: { $ne: "" } });
        let cityvalues = cities.map(i => { return i.city });

        await CRMCity.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
        await Lead.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
        await ReferredParty.updateMany({ city: { $nin: cityvalues } }, { city: 'unknown', state: 'unknown' });
        return res.status(200).json({ message: "successfull" })
    }

    public async GetAllCRMStates(req: Request, res: Response, next: NextFunction) {
        let result: GetCrmStateDto[] = []
        let states = await CRMState.find()

        for (let i = 0; i < states.length; i++) {
            let users = await (await User.find({ assigned_crm_states: states[i]._id })).map((i) => { return { _id: i._id.valueOf(), username: i.username } })
            result.push({
                _id: states[i]._id, alias1: states[i].alias1,
                alias2: states[i].alias2, state: states[i].state, assigned_users: String(users.map((u) => { return u.username }))
            });
        }
        return res.status(200).json(result)
    }


    public async CreateCRMState(req: Request, res: Response, next: NextFunction) {
        const { state, alias1, alias2 } = req.body as { state: string, alias1: string, alias2: string }
        if (!state) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await CRMState.findOne({ state: state.toLowerCase() }))
            return res.status(400).json({ message: "already exists this state" })
        let result = await new CRMState({
            state: state,
            alias1: alias1,
            alias2: alias2,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }
    public async AssignCRMStatesToUsers(req: Request, res: Response, next: NextFunction) {
        const { state_ids, user_ids, flag } = req.body as { state_ids: string[], user_ids: string[], flag: number }
        if (state_ids && state_ids.length === 0)
            return res.status(400).json({ message: "please select one state " })
        if (user_ids && user_ids.length === 0)
            return res.status(400).json({ message: "please select one state owner" })

        let owners = user_ids

        if (flag == 0) {
            for (let k = 0; k < owners.length; k++) {
                let owner = await User.findById(owners[k]).populate('assigned_crm_states')
                if (owner) {
                    let oldstates = owner.assigned_crm_states.map((item) => { return item._id.valueOf() });
                    oldstates = oldstates.filter((item) => { return !state_ids.includes(item) });
                    let newStates: ICRMState[] = [];

                    for (let i = 0; i < oldstates.length; i++) {
                        let state = await CRMState.findById(oldstates[i]);
                        if (state)
                            newStates.push(state)
                    }

                    await User.findByIdAndUpdate(owner._id, {
                        assigned_crm_states: oldstates,
                    })
                }
            }
        }
        else {
            for (let k = 0; k < owners.length; k++) {
                const user = await User.findById(owners[k]).populate('assigned_crm_states')
                if (user) {
                    let assigned_states = user.assigned_crm_states;
                    for (let i = 0; i <= state_ids.length; i++) {
                        if (!assigned_states.map(i => { return i._id.valueOf() }).includes(state_ids[i])) {
                            let state = await CRMState.findById(state_ids[i]);
                            if (state)
                                assigned_states.push(state)
                        }
                    }

                    user.assigned_crm_states = assigned_states
                    await user.save();
                }

            }
        }

        return res.status(200).json({ message: "successfull" })
    }

    public async UpdateCRMState(req: Request, res: Response, next: NextFunction) {
        const { state, alias1, alias2 } = req.body as { state: string, alias1: string, alias2: string }
        if (!state) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        const id = req.params.id
        let oldstate = await CRMState.findById(id)
        if (!oldstate)
            return res.status(404).json({ message: "state not found" })
        if (state !== oldstate.state)
            if (await CRMState.findOne({ state: state.toLowerCase() }))
                return res.status(400).json({ message: "already exists this state" })
        let prevstate = oldstate.state
        oldstate.state = state
        oldstate.alias1 = alias1
        oldstate.alias2 = alias2
        oldstate.updated_at = new Date()
        if (req.user)
            oldstate.updated_by = req.user

        await Lead.updateMany({ state: prevstate }, { state: state })
        await ReferredParty.updateMany({ state: prevstate }, { state: state })

        await oldstate.save()
        return res.status(200).json(oldstate)

    }
    public async DeleteCRMState(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "state id not valid" })
        let state = await CRMState.findById(id);
        if (!state) {
            return res.status(404).json({ message: "state not found" })
        }

        await state.remove();
        return res.status(200).json({ message: "state deleted successfully" })
    }
    public async BulkCreateAndUpdateCRMStatesFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: { state: string, status?: any }[] = []
        let statusText: string = ""
        if (!req.file)
            return res.status(400).json({
                message: "please provide an Excel file",
            });
        if (req.file) {
            const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
            if (req.file.size > 100 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
            const workbook = xlsx.read(req.file.buffer);
            let workbook_sheet = workbook.SheetNames;
            let workbook_response: ICRMState[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }

            for (let i = 0; i < workbook_response.length; i++) {
                let item = workbook_response[i]
                let state: string | null = String(item.state)


                if (state) {
                    if (item._id && isMongoId(String(item._id))) {
                        await CRMState.findByIdAndUpdate(item._id, { state: state.toLowerCase() })
                        statusText = "updated"
                    }

                    if (!item._id || !isMongoId(String(item._id))) {
                        let oldstate = await CRMState.findOne({ state: state.toLowerCase() })
                        if (!oldstate) {
                            await new CRMState({
                                state: state,
                                created_by: req.user,
                                updated_by: req.user,
                                created_at: new Date(),
                                updated_at: new Date()
                            }).save()
                            statusText = "created"
                        }
                        else
                            statusText = "duplicate"
                    }

                }
                else
                    statusText = "required state"

                result.push({
                    ...item,
                    status: statusText
                })
            }


        }
        return res.status(200).json(result);
    }

    public async FindUnknownCrmSates(req: Request, res: Response, next: NextFunction) {
        let states = await CRMState.find({ state: { $ne: "" } });
        let statevalues = states.map(i => { return i.state });
        await Lead.updateMany({ state: { $nin: statevalues } }, { state: 'unknown' });
        await ReferredParty.updateMany({ state: { $nin: statevalues } }, { state: 'unknown' });
        return res.status(200).json({ message: "successfull" })
    }

    public async GetAllKey(req: Request, res: Response, next: NextFunction) {
        let category = req.query.category;

        let data: IKey[]
        if (category == 'all')
            data = await Key.find().populate('category').sort("key");
        else
            data = await Key.find({ category: category }).populate('category').sort("key");



        let result: GetKeyDto[] = [];

        for (let i = 0; i < data.length; i++) {
            let users = await (await User.find({ assigned_keys: data[i]._id })).
                map((i) => { return { _id: i._id.valueOf(), username: i.username } })
            result.push(
                {
                    _id: data[i]._id,
                    serial_no: String(data[i].serial_no),
                    key: data[i].key,
                    type: data[i].type,
                    category: { id: data[i].category._id, label: data[i].category.category },
                    is_date_key: data[i].is_date_key,
                    map_to_state: data[i].map_to_state,
                    map_to_username: data[i].map_to_username,
                    assigned_users: String(users.map((u) => { return u.username }))
                });
        }
        return res.status(200).json(result)
    }


    public async CreateKey(req: Request, res: Response, next: NextFunction) {
        let { key, category, type, serial_no, is_date_key,
            map_to_state,
            map_to_username, } = req.body as {
                key: string, category: string, type: string, serial_no: number, is_date_key: false,
                map_to_username: false,
                map_to_state: false
            }
        if (!category || !key || !type) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }
        if (await Key.findOne({ key: key, category: category }))
            return res.status(400).json({ message: "already exists this key" })


        let result = await new Key({
            key,
            type,
            serial_no,
            is_date_key,
            map_to_state,
            map_to_username,
            category: category,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateKey(req: Request, res: Response, next: NextFunction) {
        let { key, category, type, serial_no, is_date_key,
            map_to_state,
            map_to_username, } = req.body as {
                key: string,
                category: string,
                type: string,
                serial_no: number, is_date_key: false,
                map_to_username: false,
                map_to_state: false
            }
        if (!category || !key || !type) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }


        const id = req.params.id
        let oldkey = await Key.findById(id)
        if (!oldkey)
            return res.status(404).json({ message: "key not found" })

        if (oldkey.key !== key)
            if (await Key.findOne({ key: key, category: category }))
                return res.status(400).json({ message: "already exists this key" })

        await Key.findByIdAndUpdate(id, {
            key,
            serial_no,
            type,
            is_date_key,
            map_to_state,
            map_to_username,
            category: category,
            updated_at: new Date(),
            updated_by: req.user
        })

        return res.status(200).json(oldkey)

    }
    public async DeleteKey(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "key id not valid" })
        let key = await Key.findById(id);
        if (!key) {
            return res.status(404).json({ message: "key not found" })
        }
        await key.remove();
        return res.status(200).json({ message: "key deleted successfully" })
    }

    public async AssignKeysToUsers(req: Request, res: Response, next: NextFunction) {
        const { key_ids, user_ids, flag } = req.body as {
            user_ids: string[],
            key_ids: string[],
            flag: number
        }
        if (key_ids && key_ids.length === 0)
            return res.status(400).json({ message: "please select one employee " })
        if (user_ids && user_ids.length === 0)
            return res.status(400).json({ message: "please select one user" })

        let owners = user_ids

        if (flag == 0) {
            for (let i = 0; i < owners.length; i++) {
                let owner = await User.findById(owners[i]).populate('assigned_keys');
                if (owner) {
                    let oldemps = owner.assigned_keys.map((item) => { return item._id.valueOf() });
                    oldemps = oldemps.filter((item) => { return !key_ids.includes(item) });
                    await User.findByIdAndUpdate(owner._id, {
                        assigned_keys: oldemps
                    })
                }
            }
        }
        else for (let k = 0; k < owners.length; k++) {
            const user = await User.findById(owners[k])
            if (user) {
                let assigned_keys: any[] = user.assigned_keys;
                for (let i = 0; i < key_ids.length; i++) {
                    if (!assigned_keys.includes(key_ids[i])) {
                        assigned_keys.push(key_ids[i])
                    }
                }
                user.assigned_keys = assigned_keys
                await user.save();
            }

        }

        return res.status(200).json({ message: "successfull" })
    }
    public async CreateKeysFromExcel(req: Request, res: Response, next: NextFunction) {
        let result: CreateKeyFromExcelDto[] = []
        let statusText: string = ""
        if (!req.file)
            return res.status(400).json({
                message: "please provide an Excel file",
            });
        if (req.file) {
            const allowedFiles = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "text/csv"];
            if (!allowedFiles.includes(req.file.mimetype))
                return res.status(400).json({ message: `${req.file.originalname} is not valid, only excel and csv are allowed to upload` })
            if (req.file.size > 100 * 1024 * 1024)
                return res.status(400).json({ message: `${req.file.originalname} is too large limit is :100mb` })
            const workbook = xlsx.read(req.file.buffer);
            let workbook_sheet = workbook.SheetNames;
            let workbook_response: CreateKeyFromExcelDto[] = xlsx.utils.sheet_to_json(
                workbook.Sheets[workbook_sheet[0]]
            );
            if (workbook_response.length > 3000) {
                return res.status(400).json({ message: "Maximum 3000 records allowed at one time" })
            }
            let end_date = new Date();
            end_date.setFullYear(end_date.getFullYear() + 30)
            for (let i = 0; i < workbook_response.length; i++) {
                let keyItem = workbook_response[i]
                let serial_no: number | null = keyItem.serial_no
                let key: string | null = keyItem.key
                let type: string | null = keyItem.type
                let category: string | null = keyItem.category
                let _id: string | undefined = keyItem._id
                let is_date_key: boolean | null = keyItem.is_date_key
                let map_to_username: boolean | null = keyItem.map_to_username
                let map_to_state: boolean | null = keyItem.map_to_state

                if (is_date_key == true) {
                    key = convertDateToExcelFormat(key)
                }

                let validated = true

                //important
                if (!key) {
                    validated = false
                    statusText = "required key"
                }
                if (!serial_no) {
                    validated = false
                    statusText = "required serial_no"
                }
                if (!category) {
                    validated = false
                    statusText = "required category"
                }
                if (!type) {
                    validated = false
                    statusText = "required type"
                }
                if (type && !['number', 'string', 'date', 'timestamp', 'boolean'].includes(type)) {
                    validated = false
                    statusText = `invalid type`
                }
                if (category) {
                    let cat = await KeyCategory.findOne({ category: category })
                    if (!cat) {
                        validated = false
                        statusText = "category not found"
                    }
                    else
                        category = cat._id
                }
                console.log(keyItem)
                if (validated) {
                    if (_id && isMongoId(String(_id))) {
                        let ch = await Key.findById(_id)
                        if (ch?.key !== key) {
                            if (await Key.findOne({ key: key, category: category })) {
                                validated = false
                                statusText = `key ${key} exists`
                            }
                        }
                        else {
                            await Key.findByIdAndUpdate(_id, {
                                key,
                                serial_no,
                                type,
                                is_date_key: is_date_key ? true : false,
                                map_to_username: map_to_username ? true : false,
                                map_to_state: map_to_state ? true : false,
                                category: category,
                                updated_at: new Date(),
                                updated_by: req.user
                            })
                            statusText = "updated"
                        }
                    }
                    else {
                        let keyl = await Key.findOne({ key: key, category: category })
                        if (keyl) {
                            validated = false
                            statusText = `${keyl.key} already exists`
                        }
                        else {
                            await new Key({
                                key,
                                serial_no,
                                type,
                                is_date_key: is_date_key ? true : false,
                                map_to_username: map_to_username ? true : false,
                                map_to_state: map_to_state ? true : false,
                                category: category,
                                created_by: req.user,
                                updated_by: req.user,
                                updated_at: new Date(Date.now()),
                                created_at: new Date(Date.now())
                            }).save()
                            statusText = "created"
                        }
                    }


                }
                result.push({
                    ...keyItem,
                    status: statusText
                })
            }
        }
        return res.status(200).json(result);
    }
    public async DownloadExcelTemplateForCreateKeys(req: Request, res: Response, next: NextFunction) {
        let keys: CreateKeyFromExcelDto[] = [{
            _id: "umc3m9344343vn934",
            serial_no: 1,
            key: 'Employee Name',
            category: 'visitsummary',
            type: 'string',
            is_date_key: false,
            map_to_username: false,
            map_to_state: false
        }]
        let cat = req.query.category
        let data: CreateKeyFromExcelDto[] = []
        if (cat !== 'all') {
            data = (await Key.find({ category: cat }).populate('category')).map((u) => {
                return {
                    _id: u._id.valueOf(),
                    serial_no: u.serial_no,
                    key: u.key,
                    type: u.type,
                    category: u.category.category,
                    is_date_key: u.is_date_key,
                    map_to_username: u.map_to_username,
                    map_to_state: u.map_to_state
                }
            })
        }
        else {
            data = (await Key.find().populate('category')).map((u) => {
                return {
                    _id: u._id.valueOf(),
                    serial_no: u.serial_no,
                    key: u.key,
                    type: u.type,
                    category: u.category.category,
                    is_date_key: u.is_date_key,
                    map_to_username: u.map_to_username,
                    map_to_state: u.map_to_state
                }
            })
        }

        if (data.length > 0) {
            keys = data
        }
        let categories = (await KeyCategory.find()).map((u) => { return { name: u.category } })

        let template: { sheet_name: string, data: any[] }[] = []
        template.push({ sheet_name: 'template', data: keys })
        template.push({ sheet_name: 'categories', data: categories })
        template.push({ sheet_name: 'types', data: [{ type: "string" }, { type: "number" }, { type: "date" }, { type: "timestamp" }, { type: 'boolean' }] })
        ConvertJsonToExcel(template)
        let fileName = "CreateKeysTemplate.xlsx"
        return res.download("./file", fileName)
    }

    public async GetAllKeyCategory(req: Request, res: Response, next: NextFunction) {
        let data: IKeyCategory[] = []
        data = await KeyCategory.find();
        let result: GetKeyCategoryDto[] = [];
        for (let i = 0; i < data.length; i++) {
            let users = await (await User.find({ assigned_keycategories: data[i]._id })).map((i) => { return { _id: i._id.valueOf(), username: i.username } })
            result.push({ _id: data[i]._id, display_name: data[i].display_name, category: data[i].category, skip_bottom_rows: String(data[i].skip_bottom_rows), assigned_users: String(users.map((u) => { return u.username })) });
        }
        return res.status(200).json(result)
    }


    public async GetKeyCategoryById(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id
        if (!isMongoId(id)) {
            return res.status(400).json({ message: "invalid id" })
        }
        let category = await KeyCategory.findById(id)
        let result: DropDownDto | null = null;
        if (category)
            result = { id: category._id, label: category.display_name }
        return res.status(200).json(result)
    }

    public async GetAllKeyCategoryForDropDown(req: Request, res: Response, next: NextFunction) {
        let assigned_keycategories: any[] = req.user.assigned_keycategories;
        let show_assigned_only = req.query.show_assigned_only
        let data: IKeyCategory[] = []
        if (show_assigned_only)
            data = await KeyCategory.find({ _id: { $in: assigned_keycategories } });
        else
            data = await KeyCategory.find();

        let result: DropDownDto[] = [];
        result = data.map((R) => { return { id: R._id, label: R.display_name, value: R.category } })
        return res.status(200).json(result)
    }



    public async CreateKeyCategory(req: Request, res: Response, next: NextFunction) {
        let { key, skip_bottom_rows, display_name } = req.body as { key: string, display_name: string, skip_bottom_rows: number, }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }

        if (await KeyCategory.findOne({ category: key }))
            return res.status(400).json({ message: "already exists this category" })
        let result = await new KeyCategory({
            category: key,
            display_name: display_name,
            skip_bottom_rows,
            updated_at: new Date(),
            created_by: req.user,
            updated_by: req.user
        }).save()
        return res.status(201).json(result)

    }

    public async UpdateKeyCategory(req: Request, res: Response, next: NextFunction) {
        let { key, skip_bottom_rows, display_name } = req.body as { key: string, display_name: string, skip_bottom_rows: number, }
        if (!key) {
            return res.status(400).json({ message: "please fill all reqired fields" })
        }


        const id = req.params.id
        let oldcategory = await KeyCategory.findById(id)
        if (!oldcategory)
            return res.status(404).json({ message: "category not found" })

        if (oldcategory.category !== key)
            if (await KeyCategory.findOne({ category: key }))
                return res.status(400).json({ message: "already exists this category" })
        oldcategory.category = key
        oldcategory.display_name = display_name
        oldcategory.skip_bottom_rows = skip_bottom_rows
        oldcategory.updated_at = new Date()
        if (req.user)
            oldcategory.updated_by = req.user
        await oldcategory.save()
        return res.status(200).json(oldcategory)

    }

    public async DeleteKeyCategory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "category id not valid" })
        let category = await KeyCategory.findById(id);
        if (!category) {
            return res.status(404).json({ message: "category not found" })
        }
        await category.remove();
        return res.status(200).json({ message: "category deleted successfully" })
    }


    public async AssignKeyCategoriesToUsers(req: Request, res: Response, next: NextFunction) {
        const { categoryids, user_ids, flag } = req.body as { categoryids: string[], user_ids: string[], flag: number }
        if (categoryids && categoryids.length === 0)
            return res.status(400).json({ message: "please select one category " })
        if (user_ids && user_ids.length === 0)
            return res.status(400).json({ message: "please select one user" })

        let owners = user_ids

        if (flag == 0) {
            for (let k = 0; k < owners.length; k++) {
                let owner = await User.findById(owners[k]).populate('assigned_keycategories')
                if (owner) {
                    let oldcategorys = owner.assigned_keycategories.map((item) => { return item._id.valueOf() });
                    oldcategorys = oldcategorys.filter((item) => { return !categoryids.includes(item) });
                    let newCategories: IKeyCategory[] = [];

                    for (let i = 0; i < oldcategorys.length; i++) {
                        let category = await KeyCategory.findById(oldcategorys[i]);
                        if (category)
                            newCategories.push(category)
                    }
                    await User.findByIdAndUpdate(owner._id, {
                        assigned_keycategories: oldcategorys,
                    })
                }
            }
        }
        else {
            for (let k = 0; k < owners.length; k++) {
                const user = await User.findById(owners[k])
                if (user) {
                    let assigned_categorys: any[] = user.assigned_keycategories;
                    for (let i = 0; i < categoryids.length; i++) {
                        if (!assigned_categorys.includes(categoryids[i])) {
                            assigned_categorys.push(categoryids[i])
                        }
                    }
                    user.assigned_keycategories = assigned_categorys
                    await user.save();
                }

            }
        }

        return res.status(200).json({ message: "successfull" })
    }
   
}