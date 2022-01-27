package slices

func ExcludeString(objs []string, exclude string) []string {
	res := make([]string, 0, len(objs))
	for _, obj := range objs {
		if obj != exclude {
			res = append(res, obj)
		}
	}
	return res
}
