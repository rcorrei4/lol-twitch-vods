import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/Button/Button";
import type { GalleryElement } from "~/components/Gallery/Gallery";
import Tabs from "~/components/Tabs/Tabs";

type HomePageProps = {
  streamers: GalleryElement[];
  champions: GalleryElement[];
};

export function HomePage({ streamers, champions }: HomePageProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleFormSubmit = async () => {
    if (searchParams.size > 0) {
      const href = "/results?" + searchParams.toString();
      navigate(href);
    }
  };

  return (
    <div>
      <Tabs champions={champions} streamers={streamers} />
      <Button
        className="fixed bottom-10 right-10 shadow-2xl shadow-gray-two"
        onClick={handleFormSubmit}
      >
        Get results
      </Button>
    </div>
  );
}
