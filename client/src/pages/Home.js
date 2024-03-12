import React from "react";
import { Link, useLocation } from "react-router-dom";
import styles from "../css/tailwindStylesLiterals";
// import Button from "../components/Button";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
// import { ProfileForm } from "../components/FormPlay";
import { Form } from "../components/ui/form";

const Home = function (props) {
  const location = useLocation();

  return (
    <div className="h-screen w-screen bg-blue-950 flex flex-col items-center">
      <h1 className="text-white font-semibold text-7xl p-8 text-center mt-72">
        Just One
      </h1>

      <div className="flex flex-row w-[35vw] justify-evenly">
        <Dialog>
          <DialogTrigger>
            <Button className={styles.greenButton}>Open</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create A Room</DialogTitle>
              <DialogDescription>
                <Form></Form>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Link to="howToPlay" state={{ previousLocation: location }}>
          <Button className={styles.redButton}>How To Play</Button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
