import { IChecklistBox } from "../interfaces/ChecklistInterface"

export function getChecklistScore(boxes: IChecklistBox[]) {
    let expectedScore = 0
    let actualScore = 0
    boxes.forEach((box) => {
        if (Number(new Date(box.date).getDay()) !== 0) {
            expectedScore = expectedScore + 1
            actualScore = actualScore + box.score

        }
    })
    return parseFloat(Number(actualScore / expectedScore).toFixed(2))
}

