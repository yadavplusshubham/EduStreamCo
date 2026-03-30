import WatchPageWrapper from './WatchPageWrapper';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

async function getCourse(courseId) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/courses/${courseId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const course = await getCourse(params.courseId);

  if (!course) {
    return {
      title: 'Course Not Found – EduStream',
    };
  }

  return {
    title: `${course.title} – EduStream`,
    description: course.description || `Watch ${course.title} — ${course.videoCount} lectures from ${course.channelTitle}.`,
    openGraph: {
      title: `${course.title} – EduStream`,
      description: course.description || `${course.videoCount} lectures from ${course.channelTitle}.`,
      images: course.thumbnail ? [{ url: course.thumbnail, width: 1280, height: 720 }] : [],
      type: 'video.tv_show',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} – EduStream`,
      description: course.description || `${course.videoCount} lectures.`,
      images: course.thumbnail ? [course.thumbnail] : [],
    },
  };
}

export default function WatchPage({ params, searchParams }) {
  return <WatchPageWrapper courseId={params.courseId} initialModule={searchParams?.module} />;
}
