import { redirect } from "next/navigation";

// /reviews/write has no content of its own: the product finder that starts a
// draft lives on /reviews. (/reviews/write/<product> is the form; see lib/route-guards.ts.)
export default function WriteReviewIndexPage() {
  redirect("/reviews#draft-title");
}
