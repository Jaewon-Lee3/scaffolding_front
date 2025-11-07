import { PassageDetailClient } from "./passage-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PassageDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PassageDetailClient passageId={id} />;
}
