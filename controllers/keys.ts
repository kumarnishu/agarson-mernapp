import { NextFunction, Request, Response } from 'express';
import { User } from "../models/user";
import isMongoId from "validator/lib/isMongoId";
import { IKey, Key } from '../models/keys';
import { CreateOrEditKeyDto, GetKeyDto } from '../dtos';


// export const GetAllKeys = async (req: Request, res: Response, next: NextFunction) => {
//     let result: GetKeyDto[] = []
//     let category = req.query.category;
//     let keys: IKey[] = []
//     if (category && category !== 'all')
//         keys = await Key.find({ category: category })
//     else
//         keys = await Key.find()
//     for (let i = 0; i < keys.length; i++) {
//         let users = await (await User.find({ assigned_crm_keys: keys[i]._id })).
//             map((i) => { return { _id: i._id.valueOf(), username: i.username } })
//         result.push(
//             {
//                 _id: keys[i]._id,
//                 city: keys[i].city,
//                 category: keys[0].category,
//                 assigned_users: String(users.map((u) => { return u.username }))
//             });
//     }
//     return res.status(200).json(result)
// }

// export const CreateKey = async (req: Request, res: Response, next: NextFunction) => {
//     const { key, category } = req.body as CreateOrEditKeyDto
//     if (!category || !key) {
//         return res.status(400).json({ message: "please provide required fields" })
//     }
//     let STate = await CRMState.findOne({ category: category })
//     if (!STate) {
//         return res.status(400).json({ message: "category not exits" })
//     }
//     if (await Key.findOne({ city: city.toLowerCase(), category: category }))
//         return res.status(400).json({ message: "already exists this city" })
//     let result = await new Key({
//         category: category,
//         city: city,
//         updated_at: new Date(),
//         created_by: req.user,
//         updated_by: req.user
//     }).save()
//     let users = await User.find({ assigned_crm_categorys: STate });
//     await assignCRMCities(users.map((i) => { return i._id.valueOf() }), [result._id.valueOf()], 1);
//     return res.status(201).json(result)

// }

// export const UpdateKey = async (req: Request, res: Response, next: NextFunction) => {
//     const { category, city } = req.body as CreateOrEditCrmCity
//     if (!category || !city) {
//         return res.status(400).json({ message: "please fill all reqired fields" })
//     }
//     if (!await CRMState.findOne({ category: category })) {
//         return res.status(400).json({ message: "category not exits" })
//     }
//     const id = req.params.id
//     let oldcity = await Key.findById(id)
//     if (!oldcity)
//         return res.status(404).json({ message: "city not found" })
//     if (city !== oldcity.city)
//         if (await Key.findOne({ city: city.toLowerCase(), category: category }))
//             return res.status(400).json({ message: "already exists this city" })
//     let prevcity = oldcity.city
//     oldcity.city = city
//     oldcity.category = category
//     oldcity.updated_at = new Date()
//     if (req.user)
//         oldcity.updated_by = req.user
//     await oldcity.save()
//     await Lead.updateMany({ city: prevcity }, { city: city })
//     await ReferredParty.updateMany({ city: prevcity }, { city: city })
//     return res.status(200).json(oldcity)

// }
// export const DeleteKey = async (req: Request, res: Response, next: NextFunction) => {
//     const id = req.params.id;
//     if (!isMongoId(id)) return res.status(403).json({ message: "city id not valid" })
//     let city = await Key.findById(id);
//     if (!city) {
//         return res.status(404).json({ message: "city not found" })
//     }

//     let STate = await CRMState.findOne({ category: city.category });
//     if (STate) {
//         let users = await User.find({ assigned_crm_categorys: STate });
//         await assignCRMCities(users.map((i) => { return i._id.valueOf() }), [city._id.valueOf()], 1);
//     }
//     await city.remove();
//     return res.status(200).json({ message: "city deleted successfully" })
// }
