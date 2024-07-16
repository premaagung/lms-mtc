import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { File } from "lucide-react";

import { GetChapter } from "@/actions/get-chapter";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";

import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";

const ChapterIdPage = async ({
    params  
}: {
    params: { courseId : string; chapterId: string }
}) => {
    const { userId } = auth();

    if (!userId) {
        return redirect ("/");
    }

    const {
        course,
        chapter,
        muxData,
        attachments,
        nextChapter,
        userProgress,
        purchase,
    } = await GetChapter({
        userId,
        chapterId: params.chapterId,
        courseId: params.courseId,
    });

    if (!chapter || !course) {
        return redirect ("/")
    }

    const isLocked = !chapter.isFree && !purchase;
    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    return ( 
        <div>
            {userProgress?.isCompleted && (
                <Banner 
                    variant="success"
                    label="You already completed this chapter."
                />
            )}
            {isLocked && (
                <Banner 
                    variant="warning"
                    label="You need to purchase this course to watch this chapter."
                />
            )}
            <div className="flex flex-col max-w-4xl mx-auto pb-20">
                <div className="p-4">
                    <VideoPlayer 
                        chapterId={params.chapterId}
                        title={chapter.title}
                        courseId={params.courseId}
                        nextChapterId={nextChapter?.id!}
                        playbackId={muxData?.playbackId!}
                        isLocked={isLocked}
                        completeOnEnd={completeOnEnd}
                    />
                </div>
                <div className="p-4 flex flex-col md:flex-row items-center justify-between">
                    <h2 className="text-2xl font-semibold mb-2">
                        {chapter.title}
                    </h2>
                    {purchase ? (
                        <div>
                        {/* //TODO: Add course progress button */}
                        </div>
                    ) : (
                        <CourseEnrollButton 
                            courseId={params.courseId}
                            price={course.price!}
                        />
                    )} 
                </div>
                <Separator />
                <div>
                    <Preview  
                        value={chapter.description!}
                    />
                </div>
                {!!attachments.length && (
                    <>
                        <Separator />
                        <div className="p-4">
                            {attachments.map((attachments)=> (
                                <a 
                                    href={attachments.url}
                                    target="_blank"
                                    key={attachments.id}
                                    className="flex items-center p-3 w-full bg-sky-200 border text-sky-700 rounded-md hover:underline"
                                >
                                    <File />
                                    <p className="line-clamp-1">
                                        {attachments.name}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
     );
}
 
export default ChapterIdPage;