import { NextFunction, Request, Response } from 'express';
import moment from "moment";
import { CreateOrEditSampleRemarkDto, GetSampleSystemRemarkDto } from "../dtos/RemarkDto";
import isMongoId from "validator/lib/isMongoId";
import { SampleSystemRemark } from "../models/RemarksModel";
import { ISampleSystemRemark } from "../interfaces/RemarkInterface";
import { SampleSystem } from '../models/PartPageModel';


export class RemarkController {

    public async UpdateSampleSystemRemark(req: Request, res: Response, next: NextFunction) {
        const { remark, next_call, sample, stage } = req.body as CreateOrEditSampleRemarkDto
        if (!remark) return res.status(403).json({ message: "please fill required fields" })

        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await SampleSystemRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        let sampleSystem = await SampleSystem.findById(sample)

        if (sampleSystem) {
            sampleSystem.last_remark = remark
            sampleSystem.stage = stage
        }

        rremark.remark = remark
        if (next_call) {
            rremark.next_call = new Date(next_call)
            if (sampleSystem)
                sampleSystem.next_call = new Date(next_call)
        }
        await rremark.save()
        if (sampleSystem)
            await sampleSystem.save()
        return res.status(200).json({ message: "remark updated successfully" })
    }

    public async DeleteSampleSystemRemark(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        if (!isMongoId(id)) return res.status(403).json({ message: "id not valid" })
        let rremark = await SampleSystemRemark.findById(id)
        if (!rremark) {
            return res.status(404).json({ message: "remark not found" })
        }
        await rremark.remove()
        return res.status(200).json({ message: " remark deleted successfully" })
    }


    public async GetSampleSystemRemarkHistory(req: Request, res: Response, next: NextFunction) {
        const id = req.params.id;
        let remarks: ISampleSystemRemark[] = []
        let result: GetSampleSystemRemarkDto[] = []
        remarks = await SampleSystemRemark.find({ sample: id }).populate('sample').populate('created_by').sort('-created_at')
        result = remarks.map((r) => {
            return {
                _id: r._id,
                remark: r.remark,
                sample: { id: r.sample._id, label: r.sample.party },
                next_call: r.next_call ? moment(r.next_call).format('DD/MM/YYYY') : "",
                created_at: r.created_at && r.created_at.toString(),
                created_by: { id: r.created_by._id, label: r.created_by.username },
                updated_at: r.updated_at && r.updated_at.toString(),
                updated_by: { id: r.updated_by._id, label: r.updated_by.username }
            }
        })
        return res.json(result)
    }

    public async NewSampleSystemRemark(req: Request, res: Response, next: NextFunction) {
        const {
            remark,
            sample,
            stage,
            next_call } = req.body as CreateOrEditSampleRemarkDto
        if (!remark || !sample) return res.status(403).json({ message: "please fill required fields" })

        let sampleSystem = await SampleSystem.findById(sample)
        if (!sampleSystem) {
            return res.status(404).json({ message: "sample not found" })
        }

        let new_remark = new SampleSystemRemark({
            remark,
            sample: sampleSystem,
            created_at: new Date(Date.now()),
            created_by: req.user,
            updated_at: new Date(Date.now()),
            updated_by: req.user
        })
        if (sampleSystem) {
            sampleSystem.last_remark = remark
            sampleSystem.stage = stage
        }

        if (next_call) {
            new_remark.next_call = new Date(next_call)
            sampleSystem.next_call = new Date(next_call)
        }
        await new_remark.save()
        await sampleSystem.save()
        return res.status(200).json({ message: "remark added successfully" })
    }
}