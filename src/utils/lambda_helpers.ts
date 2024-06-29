export const makeImmutable: (obj: string[]) => { immutable: true, value: string }[] = (obj: string[])  =>    {
    return obj.map((value) => {
        return { immutable: true, value: value }
    })
}
