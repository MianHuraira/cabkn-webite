"use client";

import ApiFunction from "@/components/ApiFunction/ApiFunction";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import { FaHeart, FaRegHeart } from "react-icons/fa";

const page = () => {
  const { getData, header1, putData } = ApiFunction();
  const [Notitications, setNotitications] = useState([]);
  const [FavLoading, setFavLoading] = useState(false);
  const [Loading, setLoading] = useState(false);
  const router = useRouter();
  const getFavorites = async () => {
    setLoading(true);
    try {
      const res = await getData("users/favorite/1", header1);
      if (res?.success) {
        setNotitications(res?.users);
      }
    } catch (error) {
      console.log("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const addRideToFavRider = (data) => {
    let apiBody = {
      favUserId: data?._id,
    };
    const encodedData = encodeURIComponent(JSON.stringify(apiBody));
    router.push(`/ride?data=${encodedData}`);
  };

  const onAddFavorite = async (data) => {
    try {
      const res = await putData(`users/like/${data?._id}`, {}, header1);
      if (res?.message) {
        getFavorites();
      }
    } catch (error) {
      console.log("Error adding to favorites: ", error);
    } finally {
      setFavLoading(false);
    }
  };

  useEffect(() => {
    getFavorites();
  }, []);

  return (
    <>
      <div className="bread p-4 ">
        <h5 className="text-gray-500 text-sm">Home / Favorites</h5>
        <h3 className="text-xl font-semibold">Favorites</h3>
      </div>

      <Container className="mt-5">
        {Loading ? (
          <div className="flex justify-center items-center h-32">
            <Spinner color="#fff" />
          </div>
        ) : Notitications.length === 0 ? (
          <div className="text-center mt-5 h-32">
            <h5>No data found</h5>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-6">
            {Notitications.map((item) => {
              const isFavorite = item?.likes;

              return (
                <div
                  key={item?._id}
                  className="p-4 rounded-lg border shadow-sm bg-white flex flex-col"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <img
                        src={item?.image || "https://via.placeholder.com/150"}
                        alt="User"
                        className="h-16 w-16 sm:h-20 sm:w-20 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <p className="font-semibold text-lg">{item?.name}</p>
                        <div className="flex items-center mt-1">
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/616/616489.png"
                            alt="Star"
                            className="h-4 w-4"
                          />
                          <p className="text-sm ml-2">{item?.rating || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="cursor-pointer"
                      onClick={() => onAddFavorite(item)}
                    >
                      {isFavorite ? (
                        <FaHeart color="#004A70" size={20} />
                      ) : (
                        <FaRegHeart color="#004A70" size={20} />
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      onClick={() => addRideToFavRider(item)} // You can modify this logic as needed
                      style={{ backgroundColor: "#004A70" }}
                      className="px-4 py-1 text-sm rounded text-white regular-font"
                    >
                      {"Request"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
};

export default page;
