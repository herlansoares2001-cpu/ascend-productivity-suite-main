import { Skeleton } from "@/components/ui/skeleton";

export const ChartSkeleton = () => {
    return (
        <div className="w-full h-[300px] flex flex-col gap-4 p-4 border rounded-2xl bg-card animate-pulse">
            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/6" />
            </div>
            <div className="flex-1 w-full bg-muted/20 rounded-lg flex items-end gap-2 px-2 pb-2">
                <Skeleton className="h-1/2 flex-1" />
                <Skeleton className="h-2/3 flex-1" />
                <Skeleton className="h-3/4 flex-1" />
                <Skeleton className="h-1/2 flex-1" />
                <Skeleton className="h-4/5 flex-1" />
                <Skeleton className="h-2/3 flex-1" />
                <Skeleton className="h-1/2 flex-1" />
            </div>
        </div>
    );
};

export const CategoryChartSkeleton = () => {
    return (
        <div className="w-full h-[250px] flex items-center justify-center p-4 border rounded-2xl bg-card animate-pulse">
            <div className="w-32 h-32 rounded-full border-8 border-muted/20 flex items-center justify-center relative">
                <div className="w-16 h-16 rounded-full bg-muted/20" />
            </div>
            <div className="ml-8 space-y-2 flex-1">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
            </div>
        </div>
    );
};
