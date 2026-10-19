import RiderClient from './RiderClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Rider Console | G1mart Fleet',
  description: 'G1mart Express Delivery Partner Dispatch & Route Console',
};

export default function RiderPage() {
  return <RiderClient />;
}
