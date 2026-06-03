import { redirectYeon } from "@yeon/ui/runtime/YeonRouteControl";

export default function AdminHomePage() {
  redirectYeon("/admin/members");
}
